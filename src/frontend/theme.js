import { red } from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';

// A custom theme for this app
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#333333',
    },
    secondary: {
      main: '#aaaaaa',
    },
    text: {
      primary: '#4A4A4A',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#fff',
    },
  },
  overrides: {
    MuiFormControlLabel: {
      root: {
        marginBottom: '16px',
      },
      label: {
        fontSize: '14px',
        lineHeight: '18px',
        color: '#4A4A4A',
      },
    },
  },
});

export default theme;
