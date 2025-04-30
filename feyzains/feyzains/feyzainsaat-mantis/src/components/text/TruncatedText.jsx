import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from '@mui/material';

const TruncatedText = ({ text, maxLength = 25, title, breakWord = true }) => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const truncatedText = text.length > maxLength ? text.slice(0, maxLength) + '...' : text;

  return (
    <>
      <Box>
        <Typography component={'span'} sx={breakWord ? { whiteSpace: 'pre-wrap', wordBreak: 'break-word' } : {}} noWrap={!breakWord}>
          {truncatedText}
          {text.length > maxLength && breakWord && (
            <Typography variant="body2" color="primary" onClick={handleClickOpen} sx={{ cursor: 'pointer', display: 'inline' }}>
              {' '}
              hepsini göster
            </Typography>
          )}
        </Typography>
        {text.length > maxLength && !breakWord && (
          <Typography variant="body2" color="primary" onClick={handleClickOpen} sx={{ cursor: 'pointer', display: 'block' }}>
            hepsini göster
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
          <Typography variant="body1" sx={breakWord ? { whiteSpace: 'pre-wrap', wordBreak: 'break-word' } : {}}>
            {text.replace(/\|/g, '\n')}
          </Typography>
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

TruncatedText.propTypes = {
  text: PropTypes.string.isRequired,
  maxLength: PropTypes.number,
  title: PropTypes.string,
  breakWord: PropTypes.bool
};

export default TruncatedText;
