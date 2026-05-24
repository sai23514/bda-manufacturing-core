import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp,
  People,
  AttachMoney,
  CheckCircle
} from '@mui/icons-material';
import { fetchLeadStats } from '../../redux/slices/leadSlice';

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography color="text.secondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            bgcolor: `${color}.light`,
            borderRadius: 2,
            p: 1.5,
            display: 'flex'
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { stats, loading } = useSelector((state) => state.leads);

  useEffect(() => {
    dispatch(fetchLeadStats());
  }, [dispatch]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const totalLeads = stats?.summary?.totalLeads || 0;
  const totalValue = stats?.summary?.totalValue || 0;
  const wonLeads = stats?.summary?.wonLeads || 0;
  const conversionRate = stats?.summary?.conversionRate || 0;

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Welcome back, {user?.firstName}!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Here is what is happening with your leads today
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Leads"
            value={totalLeads}
            icon={<People sx={{ color: 'primary.main', fontSize: 32 }} />}
            color="primary"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Won Deals"
            value={wonLeads}
            icon={<CheckCircle sx={{ color: 'success.main', fontSize: 32 }} />}
            color="success"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Value"
            value={`₹${(totalValue / 100000).toFixed(1)}L`}
            icon={<AttachMoney sx={{ color: 'warning.main', fontSize: 32 }} />}
            color="warning"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Conversion Rate"
            value={`${conversionRate}%`}
            icon={<TrendingUp sx={{ color: 'info.main', fontSize: 32 }} />}
            color="info"
          />
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Lead Status Distribution
            </Typography>
            <Box sx={{ mt: 2 }}>
              {stats?.stats?.map((stat) => (
                <Box
                  key={stat._id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                    pb: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                    {stat._id}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Count: <strong>{stat.count}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Value: <strong>₹{(stat.totalValue / 100000).toFixed(2)}L</strong>
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="body2" color="text.secondary">
                Use the navigation menu to access Leads, Pipeline, and other features.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
