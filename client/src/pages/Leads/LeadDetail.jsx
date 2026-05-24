import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Divider
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { fetchLead } from '../../redux/slices/leadSlice';
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from '../../constants';
import { format } from 'date-fns';

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentLead, loading } = useSelector((state) => state.leads);

  useEffect(() => {
    if (id) {
      dispatch(fetchLead(id));
    }
  }, [dispatch, id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentLead?.lead) {
    return (
      <Box>
        <Typography>Lead not found</Typography>
      </Box>
    );
  }

  const lead = currentLead.lead;
  const activities = currentLead.activities || [];

  return (
    <Box>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/leads')}
        sx={{ mb: 2 }}
      >
        Back to Leads
      </Button>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight="bold">
            {lead.companyName}
          </Typography>
          <Chip
            label={LEAD_STATUS_LABELS[lead.status]}
            sx={{
              bgcolor: LEAD_STATUS_COLORS[lead.status],
              color: 'white'
            }}
          />
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">Contact Person</Typography>
            <Typography variant="body1" gutterBottom>{lead.contactPerson}</Typography>

            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>Email</Typography>
            <Typography variant="body1" gutterBottom>{lead.email}</Typography>

            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>Phone</Typography>
            <Typography variant="body1" gutterBottom>{lead.phone}</Typography>

            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>Source</Typography>
            <Typography variant="body1" gutterBottom sx={{ textTransform: 'capitalize' }}>
              {lead.source}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">Estimated Value</Typography>
            <Typography variant="body1" gutterBottom>
              ₹{lead.estimatedValue?.toLocaleString()}
            </Typography>

            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>Priority</Typography>
            <Typography variant="body1" gutterBottom sx={{ textTransform: 'capitalize' }}>
              {lead.priority}
            </Typography>

            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>Score</Typography>
            <Typography variant="body1" gutterBottom>{lead.score}/100</Typography>

            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>Created Date</Typography>
            <Typography variant="body1" gutterBottom>
              {format(new Date(lead.createdAt), 'MMM dd, yyyy HH:mm')}
            </Typography>
          </Grid>

          {lead.requirements && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">Requirements</Typography>
              <Typography variant="body1">{lead.requirements}</Typography>
            </Grid>
          )}

          {lead.notes && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
              <Typography variant="body1">{lead.notes}</Typography>
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Activities ({activities.length})
        </Typography>

        {activities.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No activities yet
          </Typography>
        ) : (
          <Box sx={{ mt: 2 }}>
            {activities.map((activity) => (
              <Paper key={activity._id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {activity.subject}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {activity.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {format(new Date(activity.createdAt), 'MMM dd, yyyy HH:mm')} •{' '}
                  <span style={{ textTransform: 'capitalize' }}>{activity.type}</span>
                </Typography>
              </Paper>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default LeadDetail;
