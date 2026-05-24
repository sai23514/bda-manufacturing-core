import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Paper, Grid, Chip, CircularProgress } from '@mui/material';
import { fetchLeads, updateLeadStatus } from '../../redux/slices/leadSlice';
import { LEAD_STATUS, LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from '../../constants';
import { useSnackbar } from 'notistack';

const Pipeline = () => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { leads, loading } = useSelector((state) => state.leads);
  const [draggedLeadId, setDraggedLeadId] = useState(null);

  useEffect(() => {
    dispatch(fetchLeads());
  }, [dispatch]);

  const handleStatusChange = async (leadId, newStatus) => {
    const lead = leads.find((item) => item._id === leadId);
    if (!lead || lead.status === newStatus) {
      return;
    }

    try {
      await dispatch(updateLeadStatus({ id: leadId, status: newStatus })).unwrap();
      enqueueSnackbar('Lead status updated', { variant: 'success' });
      dispatch(fetchLeads());
    } catch (error) {
      enqueueSnackbar(error || 'Failed to update status', { variant: 'error' });
    }
  };

  const handleDrop = async (event, newStatus) => {
    event.preventDefault();

    if (!draggedLeadId) {
      return;
    }

    await handleStatusChange(draggedLeadId, newStatus);
    setDraggedLeadId(null);
  };

  const getLeadsByStatus = (status) => {
    return leads.filter((lead) => lead.status === status);
  };

  const pipelineStages = [
    LEAD_STATUS.NEW,
    LEAD_STATUS.CONTACTED,
    LEAD_STATUS.QUALIFIED,
    LEAD_STATUS.PROPOSAL,
    LEAD_STATUS.NEGOTIATION,
    LEAD_STATUS.WON
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Sales Pipeline
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manufacturing sales opportunities by stage
      </Typography>

      <Grid container spacing={2}>
        {pipelineStages.map((status) => {
          const stageLeads = getLeadsByStatus(status);
          const totalValue = stageLeads.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0);

          return (
            <Grid item xs={12} sm={6} md={4} lg={2} key={status}>
              <Paper
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleDrop(event, status)}
                sx={{
                  p: 2,
                  bgcolor: 'background.default',
                  minHeight: '70vh',
                  border: '2px solid',
                  borderColor: LEAD_STATUS_COLORS[status]
                }}
              >
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={LEAD_STATUS_LABELS[status]}
                    sx={{
                      bgcolor: LEAD_STATUS_COLORS[status],
                      color: 'white',
                      fontWeight: 'bold',
                      width: '100%'
                    }}
                  />
                  <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center' }}>
                    {stageLeads.length} leads • ₹{(totalValue / 100000).toFixed(1)}L
                  </Typography>
                </Box>

                <Box>
                  {stageLeads.map((lead) => (
                    <Paper
                      key={lead._id}
                      draggable
                      onDragStart={() => setDraggedLeadId(lead._id)}
                      onDragEnd={() => setDraggedLeadId(null)}
                      sx={{
                        p: 2,
                        mb: 1.5,
                        cursor: 'grab',
                        opacity: draggedLeadId === lead._id ? 0.6 : 1,
                        '&:hover': { boxShadow: 3 },
                        '&:active': { cursor: 'grabbing' }
                      }}
                      onClick={() => {
                        // You can add navigation or modal here
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold" noWrap>
                        {lead.companyName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {lead.contactPerson}
                      </Typography>
                      <Typography variant="body2" fontWeight="medium" sx={{ mt: 1 }}>
                        ₹{(lead.estimatedValue || 0).toLocaleString()}
                      </Typography>
                      <Chip
                        label={lead.priority}
                        size="small"
                        sx={{
                          mt: 1,
                          textTransform: 'capitalize',
                          height: 20,
                          fontSize: '0.7rem'
                        }}
                        color={
                          lead.priority === 'high' ? 'error' :
                          lead.priority === 'medium' ? 'warning' : 'success'
                        }
                      />
                    </Paper>
                  ))}

                  {stageLeads.length === 0 && (
                    <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 4 }}>
                      No leads in this stage
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default Pipeline;
