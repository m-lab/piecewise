import { red } from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';

// A custom theme for this app
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#3701b3',
    },
    secondary: {
      main: '#11cb5f',
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
