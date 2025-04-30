import React, { useState, useEffect, useContext } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Button,
  Typography,
  Box,
  Paper,
  Divider
} from "@mui/material";
import { OrderContext } from "contexts/admin/OrderContext";

const NotesPopup = ({ open, onClose, orderId }) => {
  const { notes, fetchNotes, createNote, loading } = useContext(OrderContext);

  const [newNote, setNewNote] = useState("");
  const [sending, setSending] = useState(false); // Çift tıklamayı engellemek için

  useEffect(() => {
    if (open && orderId) {
      fetchNotes(orderId);
    }
  }, [open, orderId, fetchNotes]);

  const handleSendNote = async () => {
    if (!newNote.trim() || sending) return; // Boş not göndermeyi engelle

    setSending(true);
    const response = await createNote({ order_id: orderId, content: newNote });

    if (response.success) {
      fetchNotes(orderId); // Yeni not ekledikten sonra tekrar yükle
      setNewNote("");
    } else {
      console.error("Not ekleme başarısız:", response);
    }

    setSending(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Notlar</DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Typography variant="h6">Mevcut Notlar</Typography>
          <Divider />

          {/* Notlar Listesi */}
          {loading ? (
            <Typography align="center">Yükleniyor...</Typography>
          ) : notes && notes.length > 0 ? (
            notes.map((note, index) => (
              <Paper key={index} sx={{ p: 2, bgcolor: "lightblue" }}>
                <Typography fontWeight="bold">
                  {note?.user?.first_name ? `${note.user.first_name} ${note.user.last_name}` : "Bilinmeyen Kullanıcı"}
                </Typography>
                <Typography>{note?.content || "İçerik bulunamadı."}</Typography>
                <Typography variant="caption" sx={{ display: "block", mt: 1, textAlign:"right" }}>
                  {note?.created_at ? new Date(note.created_at).toLocaleString() : ""}
                </Typography>
              </Paper>
            ))
          ) : (
            <Typography align="center" color="textSecondary">
              Henüz not eklenmemiş.
            </Typography>
          )}

          {/* Yeni Not Ekleme Alanı */}
          <Typography variant="h6">Yeni Not Ekle</Typography>
          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Yeni not ekleyin..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Kapat</Button>
        <Button onClick={handleSendNote} color="primary" disabled={!newNote.trim() || sending}>
          {sending ? "Gönderiliyor..." : "Gönder"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotesPopup;
