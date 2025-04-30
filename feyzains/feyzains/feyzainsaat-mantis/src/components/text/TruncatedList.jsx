import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import TruncatedText from './TruncatedText';

const TruncatedList = ({ items, maxItems = 2, title }) => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const truncatedItems = items.slice(0, maxItems);
  const remainingItems = items.slice(maxItems);

  return (
    <>
      <Box>
        {truncatedItems.map((item, index) => (
          <TruncatedText key={index} text={item} maxLength={50} title={title} />
        ))}
        {remainingItems.length > 0 && (
          <Typography variant="body2" color="primary" onClick={handleClickOpen} sx={{ cursor: 'pointer', display: 'block' }}>
            ... {remainingItems.length} daha
          </Typography>
        )}
      </Box>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <List>
            {items.map((item, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText primary={<TruncatedText text={item} maxLength={100} title={title} />} />
                </ListItem>
                {index < items.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

TruncatedList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  maxItems: PropTypes.number,
  title: PropTypes.string
};

export default TruncatedList;
