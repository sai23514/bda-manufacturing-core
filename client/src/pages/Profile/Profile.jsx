import { useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Avatar,
  Chip
} from '@mui/material';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Profile
      </Typography>

      <Paper sx={{ p: 4, mt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              bgcolor: 'primary.main',
              fontSize: '2.5rem'
            }}
          >
            {user.firstName?.[0]}{user.lastName?.[0]}
          </Avatar>
          <Box sx={{ ml: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              {user.firstName} {user.lastName}
            </Typography>
            <Chip
              label={user.role?.replace('_', ' ').toUpperCase()}
              color="primary"
              size="small"
              sx={{ mt: 1 }}
            />
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Email</Typography>
            <Typography variant="body1" gutterBottom>{user.email}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
            <Typography variant="body1" gutterBottom>{user.phone || 'Not provided'}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Department</Typography>
            <Typography variant="body1" gutterBottom>{user.department || 'Not assigned'}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Account Status</Typography>
            <Typography variant="body1" gutterBottom>
              {user.isActive ? 'Active' : 'Inactive'}
            </Typography>
          </Grid>

          {user.targets && (
            <>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Targets
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="text.secondary">Monthly</Typography>
                <Typography variant="body1" gutterBottom>
                  ₹{user.targets.monthly?.toLocaleString() || 0}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="text.secondary">Quarterly</Typography>
                <Typography variant="body1" gutterBottom>
                  ₹{user.targets.quarterly?.toLocaleString() || 0}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="text.secondary">Yearly</Typography>
                <Typography variant="body1" gutterBottom>
                  ₹{user.targets.yearly?.toLocaleString() || 0}
                </Typography>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default Profile;
