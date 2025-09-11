import { IconsMap } from '@/modules';
import { Layout } from '@/ui';
import { Grid, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const ErrorPage = () => {

  const navigate = useNavigate();

  const iconList = IconsMap;

  const handleIconClick = () => {
    navigate("/");
  };

  return (
    <Layout>
      <Grid item xs={12} sm={12} className='error-wrap' sx={{display:'grid', placeItems: 'center'}}>
        <div className="col-md-6">
            <div className="error">
              <span>404 Error</span>
            </div>
            <div className="error">
              <span>404 Error</span>
            </div>
            <div className="error">
              <span>404 Error</span>
            </div>
            <IconButton onClick={() => handleIconClick()} sx={{marginTop: '15vh'}}>
                  {iconList['HomeRounded']}
            </IconButton>
          </div>
      </Grid>
    </Layout>
  );
};
