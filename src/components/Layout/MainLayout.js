import { Outlet } from "react-router-dom";
import { Box, useMediaQuery } from "@mui/material";

import MainHeader from "../Header/MainHeader";
import MainFooter from "../Footer/MainFooter";

const MainLayout = () => {
  // Learn use case of <Outlet /> (Very Good) https://www.youtube.com/watch?v=dkKlhaeGO7E

  // Gives true if the screen is greater than 600px otherwise false
  const isNonMobile = useMediaQuery("(min-width: 725px)");

  // Trying how to request the data from the database using the RTK Query
  // const { data } = useGetUsersQuery(userId);
  return (
    <Box
      sx={{
        display: `${isNonMobile ? "flex" : "block"}`,
        width: "100%",
        height: "100%"
      }}
    >
      <Box width="100%" flexGrow={1}>
        <MainHeader></MainHeader>
        <Outlet />
        <MainFooter />
      </Box>
    </Box>
  );
};

export default MainLayout;
