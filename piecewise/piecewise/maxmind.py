import bisect
import csv

def load(maxmind_file):
    with open(maxmind_file) as handle:
        reader = csv.reader(handle)
        return list((int(l), int(h), unicode(isp, encoding='latin1')) for (l, h, isp) in reader)

def lookup(table, ip):
    i = bisect.bisect_right(table, (ip, None, None))
    (low, hi, isp) = table[i - 1]
    if low <= ip <= hi:
        return isp

def ip_ranges(table, pattern):
    return [(low, high) for (low, high, isp) in table if pattern.search(isp)]

if __name__ == '__main__':
    import sqlalchemy
    import random, sys
    minip = 16777216
    maxip = 3758096127
    table = load("/opt/telescope/resources/GeoIPASNum2-20140804.csv")

     random.seed(72)
     for i in xrange(100):
         ip = random.randint(minip, maxip)
         lookup(table, ip)
        
