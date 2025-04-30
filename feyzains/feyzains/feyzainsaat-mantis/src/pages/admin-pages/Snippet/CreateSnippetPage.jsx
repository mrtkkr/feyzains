import React, { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  MenuItem,
  Paper,
  Autocomplete,
} from "@mui/material";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/themes/prism.css"; // Tema: prism-tomorrow.css gibi diğerlerini de deneyebilirsin
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-css";

const languageOptions = [
  { label: "JavaScript", value: "javascript" },
  { label: "Python", value: "python" },
  { label: "CSS", value: "css" },
];

const CreateSnippetPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("// Buraya kod yaz...");
  const [language, setLanguage] = useState("javascript");
  const [tags, setTags] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const snippet = {
      title,
      description,
      code,
      language,
      tags,
    };
    console.log("Gönderilen Snippet:", snippet);
    // API isteği burada yapılır
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Snippet Oluştur
      </Typography>

      <TextField
        label="Başlık"
        fullWidth
        margin="normal"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <TextField
        label="Açıklama"
        fullWidth
        multiline
        rows={3}
        margin="normal"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <TextField
        select
        label="Dil Seç"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        margin="normal"
        fullWidth
      >
        {languageOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <Autocomplete
        multiple
        freeSolo
        options={[]}
        value={tags}
        onChange={(event, newValue) => setTags(newValue)}
        renderInput={(params) => <TextField {...params} label="Etiketler" />}
        sx={{ my: 2 }}
      />

      <Paper variant="outlined" sx={{ p: 2, minHeight: 200, backgroundColor: "#f5f5f5" }}>
        <Editor
          value={code}
          onValueChange={setCode}
          highlight={(code) => highlight(code, languages[language], language)}
          padding={10}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 14,
          }}
        />
      </Paper>

      <Box sx={{ textAlign: "right", mt: 3 }}>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Kaydet
        </Button>
      </Box>
    </Box>
  );
};

export default CreateSnippetPage;
