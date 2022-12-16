import React, { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { MainBox, DataCard } from "./styles";
import { setAppsQuantity, setTodaysAvailability, setCardTitleData, setMainData, setBarsData } from "../../store/actionCreater";
import Cards_Title from "./Card_Title";
import PopUp_Modal from "./PopUp_Modal";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import "./styles.css";
import Dates_Buttons from "./Dates_Buttons";
import Dates_Data from "./Dates_Data";
import { dataArrowsAndColors, getStateData } from "./Services"


function Availability() {
  const dispatch = useDispatch();
  const [fiveMinsData, setFiveMinsData] = React.useState([]);
  const [newAveraveData, setNewAverageData] = useState([]);
  const [show, setShow] = useState(false);
  const [openModal, setOpenModal] = React.useState();
  const [modalAppNameVar, setModalAppNameVar] = React.useState("");
  const [modalFlowNameVar, setModalFlowNameVar] = React.useState("");
  const [modalBoxPercentage, setModalBoxPercentage] = React.useState("");
  const [fiveMinsDataWithDates, setFiveMinsDataWithDates] = React.useState([]);
  const [noDataFound, setNoDataFound] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("")
  const [lastFiveDays, setLastFiveDays] = useState([]);
  const pillarName = useSelector((state) => state.pillarNameReducer.pillarName);
  const searchAppName = useSelector((state) => state.pillarNameReducer.filterAppName);
  const searchFlowName = useSelector((state) => state.pillarNameReducer.filterFlowName);
  const availabilityDate = useSelector((state) => state.pillarNameReducer.availabilityDate);
  const pillarNameParam = !pillarName ? "TRANSPORTATION" : pillarName.toUpperCase();
 

  const noDataAvailableMessage = "No data found";
  const source = axios.CancelToken.source();
  useEffect(() => {
    getStateData()
    setError("")
    setNoDataFound([]);
    setFiveMinsDataWithDates([]);
    const today = !availabilityDate ? new Date() : new Date(availabilityDate);
    const recentFiveDays = new Array(5).fill().map((_, index) => {
      const nextDate = new Date();
      // const nextDate = !availabilityDate ? new Date() : new Date(availabilityDate);
      nextDate.setDate(today.getDate() - index);
      const newFormat = nextDate.toLocaleDateString();
      console.log("new format", newFormat)
      // console.log("index", index)
      // console.log("ddd",`${newFormat.slice(6,10)}-${newFormat.slice(0,2)}-${newFormat.slice(3,5)}`)
      // return `${newFormat.slice(6,10)}-${newFormat.slice(0,2)}-${newFormat.slice(3,5)}`;
      return nextDate.toISOString().slice(0, 10);
    });
       setLastFiveDays(recentFiveDays);
    Promise.all(
      recentFiveDays.map((date) => {
        return axios(
          `https://oscs-sre-api.dev.walmart.com/availability/app_info/date?pillar=${pillarNameParam}&&create_date=${date}`, {
            cancelToken: source.token
          }
        ).then((res) => {
          setFiveMinsData(res.data) 
          return res.data
        });
      })
      ).then((res) => {
        const appMap = {};
      res.forEach((dateData) => {
        dateData.forEach((appData) => {
          if (!(appData.index in appMap)) {
            appMap[appData.index] = [];
          }
          appMap[appData.index] = [
            ...appMap[appData.index],
            appData.date_and_percentage.length > 288
              ? appData.date_and_percentage.slice(0, 288)
              : appData.date_and_percentage.concat(
                  new Array(288 - appData.date_and_percentage.length).fill(
                    {create_date: "no data available"}
                )
              ),
          ];
        });
      });
      res.forEach((dateData) => {
        dateData.forEach((appData) => {
          const newArr = new Array(288).fill({create_date: "no data available"})
          const orgArr = appMap[appData.index];
          const dataArr = new Array(5).fill(newArr)
          const finalArr = dataArr.map((n,i) => orgArr[i] ?? n)
          appData.date_and_percentage = finalArr.reverse();
       
        });
      });
      res.map(a => {
        if(a.length > 0){
          return setFiveMinsDataWithDates(a);
        }
      })
      res.filter(x => x.length > 0).length === 0 && setNoDataFound(null);
    }).catch(err => {console.log(err); setError(`Request failed with status code 404`)})
    setLoading(true);
    return () => {
      if (source) {
        source.cancel();
      }
    }
  }, [pillarNameParam, availabilityDate]);

  useEffect(() => {
    if(fiveMinsDataWithDates.length != 0){
      setLoading(false)
    };
    console.log("fiveMinsDataWithDates", fiveMinsDataWithDates);
    let totalArr = []
    let barsData;
    fiveMinsDataWithDates.map(a => {
      const tot = a.date_and_percentage[0].map(a => a.avail_percent).filter(b => b !== undefined);
     let total = tot.length > 0 ? tot.reduce((acc,cur)=> acc + cur,0) / tot.length : tot.reduce((acc,cur)=> acc + cur,0) 
      totalArr.push(total)
      barsData = a.date_and_percentage[0].slice(0,24).map(a => a.create_date)
    })
    const todaysAvailibilty = totalArr.reduce((acc,cur)=>acc+cur,0)/fiveMinsDataWithDates.length
    dispatch(setTodaysAvailability(todaysAvailibilty));
    dispatch(setAppsQuantity(fiveMinsDataWithDates.length))
    dispatch(setCardTitleData(searchFn(fiveMinsDataWithDates))) 
    dispatch(setMainData(fiveMinsDataWithDates))
    dispatch(setBarsData(barsData))
  }, [fiveMinsDataWithDates]);
  
  const modalStates = (i, x, y, z) => {
    setNewAverageData(i);
    setModalAppNameVar(x);
    setModalFlowNameVar(y);
    setModalBoxPercentage(z);
    setShow(true);
  };

const searchFn = (rows) => rows.filter((row) => row.app_name.indexOf(searchAppName) > -1).filter((row) => row.service_name.indexOf(searchFlowName) > -1);
 
  if(noDataFound == null){
    return <MainBox><h1 style={{color: "grey", marginTop:260 }} >{noDataAvailableMessage}</h1></MainBox> 
  }
  return (
    <MainBox>
      {error ? <MainBox><h1 style={{color: "grey", marginTop:260 }} >{error}</h1></MainBox> :
      loading ?   <Box sx={{ fontSize: 40, marginTop: 35, color: "blue" }}><CircularProgress /></Box>  :
       searchFn(fiveMinsDataWithDates)?.map((item, index) => {
          const toolTipData = item.date_and_percentage[4].slice(0,24)
          return (
            <DataCard key={index}>
              <Cards_Title data={item} />
              <Dates_Buttons
               item={item}
               modalStates={modalStates}
               lastFiveDays={lastFiveDays} 
               setOpenModal={setOpenModal}
               dataArrowsAndColors={dataArrowsAndColors}
              />
              <Dates_Data toolTipData={toolTipData} />
            </DataCard>
          );
        })
       }
       <PopUp_Modal
        show={show}
        modalAppNameVar={modalAppNameVar} 
        modalFlowNameVar={modalFlowNameVar}
        openModal={openModal}
        setOpenModal={setOpenModal} 
        newAveraveData={newAveraveData}
        modalBoxPercentage={modalBoxPercentage} 
        dataArrowsAndColors={dataArrowsAndColors} />
    </MainBox>
  );
}

export default Availability;

