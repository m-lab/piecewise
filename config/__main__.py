import argparse

from sqlalchemy import create_engine, MetaData
import config.aggregate
import config.config
# import config.ingest
import config.query

def refine(config, args):
    modified_aggregations = []
    for agg in config.aggregations:
        if args.only_compute is not None and not agg.name in args.only_compute:
            continue

        modified_bins = []
        for b in agg.bins:
            if args.only_bins is not None and not b.label in args.only_bins:
                continue
            modified_bins.append(b)

        modified_stats = []
        for s in agg.statistics:
            if args.only_statistics is not None and not s.label in args.only_statistics:
                continue
            modified_stats.append(s)

        modified_agg = config.aggregate.Aggregation(
                name = agg.name,
                statistics_table_name = agg.statistics_table_name,
                bins = modified_bins,
                statistics = modified_stats)
        modified_aggregations.append(modified_agg)
    return config.aggregate.Aggregator(
            database_uri = config.database_uri,
            cache_table_name = config.cache_table_name,
            filters = config.filters,
            aggregations = modified_aggregations)

def do_ingest(args):
    config = config.config.read_system_config()
    config = refine(config, args)
    if not args.debug:
        config.ingest.ingest(config)
    else:
        print "Displaying bigquery SQL instead of performing query"
        print config.ingest_bigquery_query()

def do_aggregate(args):
    config = config.config.read_system_config()
    config = refine(config, args)
    if not args.debug:
        config.aggregate.aggregate(config)
    else:
        print "Displaying Postgres SQL instead of performing query"
        config.aggregate.aggregate(config, args.debug)

def do_query(args):
    from config.aggregate import AverageRTT
    config = config.config.read_system_config()
    config = refine(config, args)
    aggregation = None
    for agg in config.aggregations:
        if agg.name == args.aggregation:
            aggregation = agg

    if args.stats is not None:
        statistics = [config.config.known_statistics[s] for s in args.stats]
    else:
        statistics = aggregation.statistics

    if args.bins is not None:
        bins = args.bins
    else:
        bins = dict()

    if args.filters is not None:
        filters = args.filters
    else:
        filters = dict()

    if not args.debug:
        results = config.query.query(config, name, statistics, bins, filters)
        for row in results:
            print row
    else:
        engine = create_engine(config.database_uri)
        metadata = MetaData()
        engine.metadata = metadata

        selection = aggregation.selection(engine, metadata, bins, filters, statistics)
        print selection.compile(engine)

def do_load(args):
    do_ingest(args)
    do_aggregate(args)

def do_display_config(args):
    config = config.config.read_system_config()
    config = refine(config, args)
    print 'Postgres connection: {}'.format(config.database_uri)
    print 'Results cache table: {}'.format(config.cache_table_name)
    print 'Filters:'
    for filt in config.filters:
        print '\t{}'.format(filt)
    print
    print 'Aggregations:'
    for agg in config.aggregations:
        print '\t{}'.format(agg.name)
        print '\t* Bin dimensions'
        for b in agg.bins:
            print '\t\t{}: {}'.format(b.label, b)
        print '\t* Aggregate statistics'
        for s in agg.statistics:
            print '\t\t{}'.format(s)

def add_ingest_args(parser):
    pass

def add_aggregate_args(parser):
    pass

def split_string(string):
    return string.split(',')

def colon_dict(string):
    pairs = string.split(',')
    def as_pair(s):
        if ':' in s:
            return tuple(s.split(':', 1))
        else:
            return (s, '')
    return dict(as_pair(p) for p in pairs)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(prog="piecewise", description="Download and aggregate m-lab internet performance data")
    parser.add_argument("--debug", action='store_true', help = 'Display rather than execute queries')
    parser.add_argument("--only-compute", type=split_string, help='Use only the named aggregations for this run')
    parser.add_argument("--only-bins", type=split_string, help='Use only the named bin dimensions for this run')
    parser.add_argument("--only-statistics", type=split_string, help='Use only the named statistics for this run')

    subparsers = parser.add_subparsers(help="Operation")

    ingest_parser = subparsers.add_parser('ingest', help='Pull data from BigQuery into postgres database')
    add_ingest_args(ingest_parser)
    ingest_parser.set_defaults(func=do_ingest)

    aggregate_parser = subparsers.add_parser('aggregate', help='Compute statistics from ingested internet performance data')
    add_aggregate_args(aggregate_parser)
    aggregate_parser.set_defaults(func=do_aggregate)

    display_config_parser = subparsers.add_parser("display-config", help='Display parsed configuration')
    display_config_parser.set_defaults(func=do_display_config)

    query_parser = subparsers.add_parser("query", help='Query statistics tables')
    query_parser.add_argument("-b", "--bins", help="Select and configure bins for query", type=colon_dict)
    query_parser.add_argument("-s", "--stats", help="Select statistics for query", type=split_string)
    query_parser.add_argument("-f", "--filters", help="Select and configure filters for query", type=colon_dict)
    query_parser.add_argument("aggregation", help="Select aggregation for query")
    query_parser.set_defaults(func=do_query)

    load_parser = subparsers.add_parser('load', help='Ingest and aggregate data in one run')
    add_ingest_args(load_parser)
    add_aggregate_args(load_parser)
    load_parser.set_defaults(func=do_load)

    args = parser.parse_args()
    args.func(args)
