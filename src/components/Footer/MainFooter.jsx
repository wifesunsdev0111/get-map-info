import React from "react";
import {
  Typography,
  useTheme,
  AppBar,
  Toolbar,
  Grid,
  Paper,
  IconButton
} from "@mui/material";
import FlexBetween from "../common/FlexBetween";
import { styled } from "@mui/material/styles";

const MainFooter = () => {
  return (
    <AppBar
      sx={{
        display: { xs: "flex", md: "flex" },
        position: "static",
        background: "#f0f0f0",
        boxShadow: "none",
        backgroundColor: "#333333"
      }}
    >
      <Toolbar
        sx={{
          height: "5rem",
          justifyContent: "center",
          textAlign: "center",
          color: "#fff",
          backgroundColor: "#4d4d4d"
        }}
      >
        <FlexBetween height="0.1rem">
          <Typography
            variant="body2"
            color="inherit"
            sx={{ fontSize: "18px", fontFamily: "OpenSans-Medium" }}
          >
            © {new Date().getFullYear()} Extract Google Place Details
          </Typography>
        </FlexBetween>
      </Toolbar>
    </AppBar>
  );
};

export default MainFooter;
