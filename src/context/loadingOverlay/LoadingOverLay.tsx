import { DefaultLoader } from '@/modules/layout/loaders';
import { useTheme } from '@mui/material/styles';

interface LoadingOverlayProps {
  loading: boolean;
  // progress?: number;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ loading }) => {
  if (!loading) return null;

  const theme = useTheme();

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#fff',
      }}
    >
      <div style={{ textAlign: 'center', animation: 'none' }}>
        <DefaultLoader
          primaryColor={theme.palette.primary.main}
          darkColor={theme.palette.primary.dark}
          lightColor={theme.palette.primary.light}
          shadowColor="#DBE3F4"
        />
      </div>
    </div>
  );
  // const classes = useStyles();

  // return (
  //   <Backdrop className={classes.backdrop} open={loading}>
  //     <div className={classes.progressContainer}>
  //       <CircularProgress
  //         color="primary"
  //         variant="determinate"
  //         value={progress}
  //       />
  //       <span className={classes.progressText}>{progress}%</span>
  //     </div>
  //   </Backdrop>
  // );
};
