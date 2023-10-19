import { React, useState, useEffect } from "react";
import {
  Box,
  useMediaQuery,
  Button,
  FormLabel,
  Paper,
  InputBase,
  Typography,
  useTheme,
  Snackbar,
  Alert,
  FormControl,
  MenuItem,
  LinearProgress,
  Select
} from "@mui/material";

import firstBackground from "../assets/images/background.jpg";
import * as XLSX from "xlsx";
import CircularProgress from "@mui/material/CircularProgress";
import { GET_BY_CID_AND_ID_URL } from "../utils/config";
import axios from "axios";

const ipcRenderer = window.require("electron").ipcRenderer;

function LinearProgressWithLabel(props) {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="#222">{`${Math.round(
          props.value
        )}%`}</Typography>
      </Box>
    </Box>
  );
}
const PlaceId = () => {
  const [excelData, setExcelData] = useState([]);
  const [uploadClick, setUploadClick] = useState(false);
  const [succesFilePath, setSuccessFilePath] = useState("");
  const [exceptionFilePath, setExceptionFilePath] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [threadCount, setThreadCount] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressOpen, setProgressOpen] = useState(false);

  const handleClose = (reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const handleSelectChange = (e) => {
    setThreadCount(e.target.value);
    console.log(threadCount);
  };

  const handleExceptionDownload = async () => {
    const path = await ipcRenderer.invoke("open-exception-dialog");
    setExceptionFilePath(path);
  };

  const handleSuccessDownload = async () => {
    const path = await ipcRenderer.invoke("open-success-dialog");
    setSuccessFilePath(path);
  };

  const handleUploadClick = () => {
    document.querySelector("input[type=file]").click();
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    setUploadClick(true);
    setExcelData([]);
    reader.onload = (e) => {
      const workbook = XLSX.read(e.target.result, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      setExcelData(data);
      setOpen(true);
      setWarningMessage("File " + file.name + " has been uploaded.");
      setUploadClick(false);
    };

    reader.readAsBinaryString(file);
  };

  const handleApiKeyInputChange = (event) => {
    setApiKey(event.target.value);
  };

  const handleDownloadButtonClick = () => {
    const delay = 30000; // 30 seconds in milliseconds
    const timer = setTimeout(() => {
      setOpen(true);
      setWarningMessage("30 seconds have passed!");
    }, delay);
    setProgress(0);
    setProgressOpen(false);
    let feildNames = excelData[0];
    let placeidIndex, idIndex, successCount, exceptionCount;
    if (excelData.length === 0) {
      setOpen(true);
      setWarningMessage("Please upload Excel sheet");
    } else if (threadCount === "") {
      setOpen(true);
      setWarningMessage("Threads field is required");
    } else if (apiKey === "") {
      setOpen(true);
      setWarningMessage("API key field is required");
    } else if (succesFilePath === "") {
      setOpen(true);
      setWarningMessage("Success file path field is required");
    } else if (exceptionFilePath === "") {
      setOpen(true);
      setWarningMessage("Exception file path field is required");
    } else {
      successCount = 0;
      exceptionCount = 0;
      setProgressOpen(true);
      feildNames.map((field, index) => {
        if (field === "PLACEID") {
          placeidIndex = index;
        }
        if (field === "ID") {
          idIndex = index;
        }
      });
      excelData.map((data, index) => {
        if (index !== 0) {
          const fetchData = async () => {
            try {
              const response = await axios.get(GET_BY_CID_AND_ID_URL, {
                params: {
                  placeid: data[placeidIndex],
                  key: apiKey
                }
              });
              const responseData = response.data;
              const successPath =
                succesFilePath + "\\" + data[idIndex] + ".txt";
              const exceptionPath =
                exceptionFilePath + "\\" + data[idIndex] + ".txt";
              const newData = {
                filename: { id: data[idIndex] },
                ...responseData
              };
              const mapData = JSON.stringify(newData, null, 2);
              if (responseData.error_message) {
                exceptionCount++;
                ipcRenderer.invoke("save-exception-file", {
                  exceptionPath,
                  mapData
                });
              } else {
                successCount++;
                ipcRenderer.invoke("save-success-file", {
                  successPath,
                  mapData
                });
              }
              const allCount = excelData.length - 1;
              setOpen(true);
              setWarningMessage(
                "Out of a total of " +
                  allCount +
                  " responses, " +
                  successCount +
                  " were successful and " +
                  exceptionCount +
                  " were exceptions."
              );
            } catch (error) {
              console.error(error);
            }
          };
          fetchData();
        }
        let proData = 100 * ((index + 1) / excelData.length);
        setProgress(proData);
      });
    }
    setProgressOpen(false);
    setExcelData([]);
    setThreadCount("");
    setSuccessFilePath("");
    setExceptionFilePath("");

    // Clean up the timer if the component is unmounted or updated
    return () => clearTimeout(timer);
  };

  const isNonMediumScreens = useMediaQuery("(min-width: 1200px)");
  const theme = useTheme();

  const [dynamicContent, setDynamicContent] = useState("");
  useEffect(() => {
    if (progressOpen) {
      setDynamicContent(
        <Box
          mt="1rem"
          sx={{ display: { xs: "none", md: "flex" } }}
          alignItems="center"
          justifyContent="center"
        >
          <LinearProgressWithLabel
            sx={{
              height: "2rem",
              width: "35rem",
              borderRadius: "1rem 1rem 1rem 1rem",
              backgroundColor: "#fff",
              color: "#222",
              fontSize: "1.5rem",
              textTransform: "none",
              boxShadow: "#222 1px 0px 5px 0px"
            }}
            value={progress}
          />
        </Box>
      );
    } else {
      setDynamicContent("");
    }
  }, [progressOpen]);

  return (
    <Box>
      <Box
        display="grid"
        backgroundColor="#f9f9f9"
        gridTemplateColumns="repeat(12, 1fr)"
        sx={{
          "& > div": {
            gridColumn: isNonMediumScreens ? undefined : "span 12"
          }
        }}
      >
        <Box
          gridColumn="span 12"
          sx={{
            backgroundColor: "#f9f9f9 !important",
            backgroundImage: `url(${firstBackground})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            width: "100%",
            height: "55.8rem" // Adjust the height as needed
          }}
        >
          <Box pt="10.5rem">
            <Typography
              fontSize="52px"
              color={theme.palette.secondary[100]}
              fontFamily="font-header"
              textAlign="center"
              sx={{ mb: "5px" }}
            >
              Extract Google Place Details via Place ID:
            </Typography>
          </Box>
          {excelData.length === 0 && uploadClick === true && (
            <Box
              mt="2rem"
              sx={{ display: { xs: "none", md: "flex" } }}
              alignItems="center"
              justifyContent="center"
            >
              <CircularProgress></CircularProgress>
            </Box>
          )}
          <Box
            mt="2rem"
            sx={{ display: { xs: "none", md: "flex" } }}
            alignItems="center"
            justifyContent="center"
          >
            <input
              type="file"
              onChange={handleImport}
              style={{ display: "none" }}
            />
            <Button
              sx={{
                height: "4.8rem",
                width: "47rem",
                borderRadius: "1rem 1rem 1rem 1rem",
                backgroundColor: "#ef6c00",
                color: "#fff",
                fontSize: "1.5rem",
                textTransform: "none",
                boxShadow: "#222 1px 0px 5px 0px"
              }}
              onClick={handleUploadClick}
            >
              Upload Excel Sheet with Place ID
            </Button>
          </Box>
          <Box
            mt="1rem"
            sx={{ display: { xs: "none", md: "flex" } }}
            alignItems="center"
            justifyContent="center"
          >
            <FormLabel
              sx={{
                height: "4.8rem",
                width: "8rem",
                color: "#000000",
                fontSize: "1.5rem",
                textAlign: "center",
                alignItems: "center",
                justifyContent: "center",
                textTransform: "none"
              }}
            >
              THREADS:
            </FormLabel>
            <FormControl>
              <Select
                sx={{
                  p: "2px 4px",
                  display: "flex",
                  alignItems: "center",
                  width: 620,
                  height: 75,
                  color: "#222",
                  backgroundColor: "#fff",
                  borderRadius: "1rem 1rem 1rem 1rem",
                  boxShadow: "#222 0px 0px 5px 0px"
                }}
                labelId="demo-controlled-open-select-label"
                id="demo-controlled-open-select"
                value={threadCount}
                onChange={handleSelectChange}
              >
                <MenuItem value={1}>1</MenuItem>
                <MenuItem value={2}>2</MenuItem>
                <MenuItem value={3}>3</MenuItem>
                <MenuItem value={1}>4</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box
            mt="1rem"
            sx={{ display: { xs: "none", md: "flex" } }}
            alignItems="center"
            justifyContent="center"
          >
            <FormLabel
              sx={{
                height: "4.8rem",
                width: "8rem",
                color: "#000000",
                fontSize: "1.5rem",
                alignItems: "center",
                textAlign: "center",
                justifyContent: "center",
                textTransform: "none"
              }}
            >
              APIKEY:
            </FormLabel>
            <Paper
              component="form"
              sx={{
                p: "2px 4px",
                display: "flex",
                alignItems: "center",
                width: 620,
                height: 75,
                backgroundColor: "#fff",
                color: "#222",
                borderRadius: "1rem 1rem 1rem 1rem",
                boxShadow: "#222 0px 0px 5px 0px"
              }}
            >
              <InputBase
                onChange={handleApiKeyInputChange}
                sx={{ ml: 1, flex: 1, color: "#222", fontSize: "1.5rem" }}
                placeholder="Please enter API key"
              />
            </Paper>
          </Box>
          <Box
            mt="1rem"
            sx={{ display: { xs: "none", md: "flex" } }}
            alignItems="center"
            justifyContent="center"
          >
            <Paper
              component="form"
              sx={{
                p: "2px 4px",
                display: "flex",
                alignItems: "center",
                width: 500,
                height: 75,
                backgroundColor: "#fff",
                color: "#222",
                borderRadius: "1rem 0 0 1rem",
                boxShadow: "#222 0px 0px 5px 0px"
              }}
            >
              <InputBase
                value={succesFilePath}
                sx={{ ml: 1, flex: 1, color: "#222", fontSize: "1.5rem" }}
                placeholder="Download Successful Response Location"
              />
            </Paper>
            <Button
              sx={{
                height: "4.8rem",
                width: "16rem",
                borderRadius: "0 1rem 1rem 0",
                backgroundColor: "#126014",
                color: "#fff",
                fontSize: "1.5rem",
                textTransform: "none",
                boxShadow: "#222 1px 0px 5px 0px"
              }}
              onClick={handleSuccessDownload}
            >
              Successful Location
            </Button>
          </Box>
          <Box
            mt="1rem"
            sx={{ display: { xs: "none", md: "flex" } }}
            alignItems="center"
            justifyContent="center"
          >
            <Paper
              component="form"
              sx={{
                p: "2px 4px",
                display: "flex",
                alignItems: "center",
                width: 500,
                height: 75,
                backgroundColor: "#fff",
                color: "#222",
                borderRadius: "1rem 0 0 1rem",
                boxShadow: "#222 0px 0px 5px 0px"
              }}
            >
              <InputBase
                value={exceptionFilePath}
                sx={{ ml: 1, flex: 1, color: "#222", fontSize: "1.5rem" }}
                placeholder="Download Exception Location"
              />
            </Paper>
            <Button
              sx={{
                height: "4.8rem",
                width: "16rem",
                borderRadius: "0 1rem 1rem 0",
                backgroundColor: "#ed1c24",
                color: "#fff",
                fontSize: "1.5rem",
                textTransform: "none",
                boxShadow: "#222 1px 0px 5px 0px"
              }}
              onClick={handleExceptionDownload}
            >
              Exception Location
            </Button>
          </Box>
          {dynamicContent}
          <Box
            mt="1rem"
            sx={{ display: { xs: "none", md: "flex" } }}
            alignItems="center"
            justifyContent="center"
          >
            <Button
              sx={{
                height: "4.8rem",
                width: "47rem",
                borderRadius: "1rem 1rem 1rem 1rem",
                backgroundColor: "#431ced",
                color: "#fff",
                fontSize: "1.5rem",
                textTransform: "none",
                boxShadow: "#222 1px 0px 5px 0px"
              }}
              onClick={handleDownloadButtonClick}
            >
              Download
            </Button>
            <Snackbar
              open={open}
              autoHideDuration={6000}
              onClose={handleClose}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right"
              }}
            >
              <Alert
                onClose={handleClose}
                severity="error"
                sx={{ width: "100%" }}
              >
                {warningMessage}
              </Alert>
            </Snackbar>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PlaceId;
