import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility,
  Delete
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { fetchLeads, createLead, deleteLead } from '../../redux/slices/leadSlice';
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, LEAD_SOURCES } from '../../constants';
import { format } from 'date-fns';

const Leads = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { leads, loading } = useSelector((state) => state.leads);

  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    source: 'website',
    estimatedValue: '',
    priority: 'medium'
  });

  useEffect(() => {
    dispatch(fetchLeads());
  }, [dispatch]);

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      source: 'website',
      estimatedValue: '',
      priority: 'medium'
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await dispatch(createLead(formData)).unwrap();
      enqueueSnackbar('Lead created successfully', { variant: 'success' });
      handleCloseDialog();
      dispatch(fetchLeads());
    } catch (error) {
      enqueueSnackbar(error || 'Failed to create lead', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await dispatch(deleteLead(id)).unwrap();
        enqueueSnackbar('Lead deleted successfully', { variant: 'success' });
        dispatch(fetchLeads());
      } catch (error) {
        enqueueSnackbar(error || 'Failed to delete lead', { variant: 'error' });
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Leads Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Create Lead
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Company</TableCell>
              <TableCell>Contact Person</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No leads found. Create your first lead!
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow key={lead._id} hover>
                  <TableCell>{lead.companyName}</TableCell>
                  <TableCell>{lead.contactPerson}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>{lead.phone}</TableCell>
                  <TableCell>
                    <Chip
                      label={LEAD_STATUS_LABELS[lead.status]}
                      size="small"
                      sx={{
                        bgcolor: LEAD_STATUS_COLORS[lead.status],
                        color: 'white'
                      }}
                    />
                  </TableCell>
                  <TableCell>₹{lead.estimatedValue?.toLocaleString()}</TableCell>
                  <TableCell>{format(new Date(lead.createdAt), 'MMM dd, yyyy')}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => navigate(`/leads/${lead._id}`)}>
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(lead._id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Lead Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Lead</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company Name"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contact Person"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Source"
                name="source"
                value={formData.source}
                onChange={handleChange}
              >
                {LEAD_SOURCES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Estimated Value"
                name="estimatedValue"
                type="number"
                value={formData.estimatedValue}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Leads;
