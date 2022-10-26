import React, { useEffect } from "react";
import "./styles.css";
import { Typography } from "@mui/material";
import { formatAvailabilityData, dataArrowsAndColors } from "./Data_Processor";
import { ArrowBox, MainBox, DataCard, SectionBox, BoxFn, BoxKey, StackData} from "./styles";
import Card_Info from "./Card_Info";
import Availability_Cards_Title from "./Card_Title";
import Loading_Error from "./Loading_Error";
import  Add from "./AvailabilityModal"

const showItem = localStorage.getItem("expandCard");
const getLocalStoreage = () => showItem ? showItem : -1;
const openModal = localStorage.getItem("modalModal");
const localStoreage = () => openModal ? openModal : false;

function Availability({ apps }) {
  const [show, setShow] = React.useState(getLocalStoreage());
  const [openModal, setOpenModal] = React.useState(localStoreage())
  const showDetails = x => show == x ? setShow(-1) : setShow(x);

  useEffect(()=> {
    localStorage.setItem("modalModal", openModal)
    localStorage.setItem("expandCard", show)
  } , [show, openModal])
 

  const foo = (i) => {
    showDetails(i)
    setOpenModal(true)
  }

  return (
    <MainBox>
      <Loading_Error />
      {apps.map((item, index) => {
        return (
          <DataCard className="card" key={index} onClick={() => foo(index)}>
            <Availability_Cards_Title data={item} />
            <SectionBox>
              <StackData direction="row">
                {formatAvailabilityData(item).map((a, i) => {
                  const xxx = dataArrowsAndColors(a.value);
                  return (
                    <BoxFn key={i}>
                      <Typography sx={{ color: xxx.color, textAlign: "center"}}>{a.value}</Typography>
                      <ArrowBox bgcolor={xxx.color} sx={{ textAlign: "center"}}>{xxx.icon}</ArrowBox>
                    </BoxFn>
                  );
                })}
              </StackData>
              <BoxKey>{formatAvailabilityData(item).map((a, i) => <h4 key={i}>{a.key}</h4>)}</BoxKey>
            </SectionBox>
            <Card_Info data={item} />
            <Add data={item} show={show} index={index} openModal={openModal} setOpenModal={setOpenModal} />
          </DataCard>
        );
      })}
    </MainBox>
  );
}

export default Availability;