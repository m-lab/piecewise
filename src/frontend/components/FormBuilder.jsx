import React, { useState, Component } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Search from '@material-ui/icons/Search';
import SaveAlt from '@material-ui/icons/SaveAlt';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Add from '@material-ui/icons/Add';
import Check from '@material-ui/icons/Check';
import Clear from '@material-ui/icons/Clear';
import Delete from '@material-ui/icons/Delete';
import Edit from '@material-ui/icons/Edit';
import Refresh from '@material-ui/icons/Refresh';
import FilterList from '@material-ui/icons/FilterList';
import Remove from '@material-ui/icons/Remove';
import MaterialTable from 'material-table';
import { fetchWithTimeout } from '../../common/utils.js';
import ReactDOM from 'react-dom';
//import { FormeoEditor } from 'formeo';

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
}));

export default class FormBuilder extends Component {
  componentDidMount() {
    //require('formeo');

    const options = {
      container: ReactDOM.findDOMNode(this.refs.builder),
      svgSprite: '/assets/img/formeo-sprite.svg',
      i18n: {
        langsDir: '/assets/lang/',
        langs: ['en-US'],
      },
    };
    new FormeoEditor(options);
  }

  render() {
    return (
      <div>
        <div ref="builder" />
      </div>
    );
  }
}

//export default function FormBuilder() {
//  const classes = useStyles();
//  const tableRef = React.createRef();
//  const [data, setData] = useState('');
//  const TIMEOUT = 1000;
//
//  function refreshIcon() {
//    return <Refresh />;
//  }
//
//  async function fetchHosts(page, pageSize) {
//    const start = page * pageSize;
//    const end = start + pageSize;
//    let url = 'api/v1/hosts?';
//    url += 'start=' + start;
//    url += '&end=' + end;
//    console.debug('url: ', url);
//    return fetchWithTimeout(url, {}, TIMEOUT)
//      .then(response => response.json())
//      .then(result => {
//        console.log('result.data: ', result.data);
//        return {
//          data: result.data,
//          page: page,
//          totalCount: result.total,
//        };
//      });
//  }
//
//  async function updateHost(host, token, audience) {
//    let url = 'api/v1/hosts';
//    const formData = new FormData();
//    formData.append('host', host);
//    formData.append('token', token);
//    formData.append('audience', audience);
//    return fetchWithTimeout(
//      url,
//      {
//        method: 'POST',
//        body: formData,
//      },
//      TIMEOUT,
//    );
//  }
//
//  async function deleteHost(host) {
//    let url = 'api/v1/hosts' + '/' + host;
//    return fetchWithTimeout(
//      url,
//      {
//        method: 'DELETE',
//      },
//      TIMEOUT,
//    );
//  }
//
//  return (
//    <Paper className={classes.paper}>
//      <MaterialTable
//        title="Host to Token Mappings"
//        tableRef={tableRef}
//        icons={{
//          Add: Add,
//          Clear: Clear,
//          Check: Check,
//          Delete: Delete,
//          Edit: Edit,
//          DetailPanel: ChevronRight,
//          Export: SaveAlt,
//          Filter: FilterList,
//          FirstPage: FirstPage,
//          LastPage: LastPage,
//          NextPage: ChevronRight,
//          PreviousPage: ChevronLeft,
//          Refresh: Refresh,
//          Search: Search,
//          ThirdStateCheck: Remove,
//        }}
//        columns={[
//          { title: 'Host', field: 'host', editable: 'onAdd' },
//          { title: 'Token', field: 'token' },
//          { title: 'Audience', field: 'audience' },
//        ]}
//        data={query => fetchHosts(query.page, query.pageSize)}
//        actions={[
//          {
//            icon: refreshIcon,
//            tooltip: 'Refresh Data',
//            isFreeAction: true,
//            onClick: () => tableRef.current && tableRef.current.onQueryChange(),
//          },
//        ]}
//        options={{
//          search: false,
//          sorting: false,
//        }}
//        editable={{
//          onRowAdd: async newData => {
//            updateHost(newData.host, newData.token, newData.audience)
//              .then(() => {
//                const dataCopy = [...data];
//                dataCopy.push(newData);
//                setData(dataCopy);
//                return;
//              })
//              .catch(err => {
//                throw err;
//              });
//          },
//          onRowUpdate: async (newData, oldData) => {
//            updateHost(oldData.host, newData.token, newData.audience)
//              .then(() => {
//                const dataCopy = [...data];
//                const index = dataCopy.indexOf(oldData);
//                dataCopy[index] = newData;
//                setData(dataCopy);
//                return;
//              })
//              .catch(err => {
//                throw err;
//              });
//          },
//          onRowDelete: async oldData => {
//            deleteHost(oldData.host)
//              .then(() => {
//                const dataCopy = [...data];
//                const index = dataCopy.indexOf(oldData);
//                dataCopy.splice(index, 1);
//                setData(dataCopy);
//                return;
//              })
//              .catch(err => {
//                throw err;
//              });
//          },
//        }}
//      />
//    </Paper>
//  );
//}
