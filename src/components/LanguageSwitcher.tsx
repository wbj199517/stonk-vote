import { useTranslation } from "react-i18next";
import { Button, Box } from "@mui/material";

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation(); 

  const changeLanguage = (lang: "en" | "zh") => {
    if (i18n && i18n.changeLanguage) {
      i18n.changeLanguage(lang);
    } else {
      console.error("i18n is not properly initialized.");
    }
  };

  return (
    <Box>
      <Button variant="contained" onClick={() => changeLanguage("en")}>
        English
      </Button>
      <Button variant="contained" onClick={() => changeLanguage("zh")} sx={{ ml: 1 }}>
        中文
      </Button>
    </Box>
  );
};

export default LanguageSwitcher;
