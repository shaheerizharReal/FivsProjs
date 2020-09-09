import React, { Fragment } from 'react';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import {useState, useEffect} from 'react';
import axios from 'axios';
import Switch from '@material-ui/core/Switch';
import Map from "./Map"
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import moment from "moment"
import {EXCLUDED_KEYS, SWITCH_KEYS, FORM_LABELS, DROPDOWN_MAPPINGS, DEPENDENT_KEYS} from './SearchFormConstants'

const useStyles = makeStyles((theme) => ({
    root: {
      '& .MuiTextField-root': {
        margin: theme.spacing(1),
        width: '200px',
      },
    },
    confirmation : {
        marginTop: "207%",
        position: "absolute"
    },
    formControl:{
        width: "46%"
    }
  }));

export default function SearchForm({open, setOpen, data, setData, refreshData, ...props}) {
    const classes = useStyles();
    const [localData, setLocalData] = useState({})
    const [mapCenter, setMapCenter] = useState(null)
    const [bounds, setBounds] = useState(null)
    var inputs;
    
    const handleClose = () => {
        setOpen(false);
        setBounds(null);
        setMapCenter(null)
    };
    const handleSubmit = async () => {
        const data = localData
        const headers = {
            "Content-Type": "application/json"
        }
        const res =  await axios.put(`/api/searches/${localData['id']}/`, data, headers)
        console.log(res);
        refreshData();
        setOpen(false);
    };

    const saveLocalData = (key, value) => {
        var temp = {...localData}
        temp[key] = value;
        setLocalData(temp);
    }

    const saveMapData = (latitudes, longitudes ) => {

        const updatedBounds = {
            min_longitude: longitudes.i,
            max_longitude: longitudes.j,
            min_latitude: latitudes.j,
            max_latitude: latitudes.i
        }

        const newLocalData = Object.assign(localData, updatedBounds)
        setLocalData(newLocalData)

        setBounds( {
            north: latitudes.i,
            south: latitudes.j,
            east: longitudes.j,
            west: longitudes.i 
        })
    }

    const handleDropdownChange = (event, field) => {
        saveLocalData(field, event.target.value)
    }

    useEffect( () =>{

        setLocalData(data)

        if(data && data.min_longitude){
            setBounds({
                north: data.max_latitude,
                south: data.min_latitude,
                east: data.max_longitude,
                west: data.min_longitude 
            })
        }
    },[data])

    return (
    <Dialog open={open} aria-labelledby="form-dialog-title" PaperProps={{
        style: {
            backgroundColor: 'white',
            borderRadius: '25px',
            padding: '20px'
        },
        }}>
        <DialogContent>
            <DialogContentText>
            </DialogContentText>
            <Box flexWrap="wrap">
            
           
            {localData && Object.keys(localData).map((value, index) =>{
                if(!EXCLUDED_KEYS.includes(value)){
                    if(SWITCH_KEYS.includes(value)){
                        return <FormControlLabel
                        value="top"
                        control={<Switch
                            checked={localData[value]}
                            onChange = {e => saveLocalData(value, !localData[value])}
                            name={value}
                        />}
                        label={FORM_LABELS[value]}
                        labelPlacement="top"
                      />
                    } else if (Object.keys(DROPDOWN_MAPPINGS).includes(value)) {
                        return (
                            <FormControl className ={classes.formControl} variant="outlined">
                                <InputLabel>
                                    {FORM_LABELS[value]}
                                </InputLabel>
                                <Select
                                    value={localData[value]}
                                    onChange={(e) => {handleDropdownChange(e, value)}}
                                >
                                    {Object.keys(DROPDOWN_MAPPINGS[value]).map( (mappingKey) => { 
                                        return <MenuItem value={mappingKey}>{DROPDOWN_MAPPINGS[value][mappingKey]}</MenuItem>
                                    })}
                                </Select>
                            </FormControl>
                        )
                    } else if (DEPENDENT_KEYS.includes(value)) {
                        { return localData['open_house'] && (
                            <Fragment>
                                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                    <KeyboardDatePicker
                                        autofocus
                                        margin="normal"
                                        key ={value}
                                        id={value}
                                        variant = "outlined"
                                        label={FORM_LABELS[value]}
                                        format="yyyy-MM-dd"
                                        minDate = {value === "open_house_start_date" ? moment() : moment(localData["open_house_start_date"])}
                                        value={moment(localData[value])}
                                        onChange = {date => saveLocalData(value, moment(date).format("YYYY-MM-DD"))}
                                    />
                                </MuiPickersUtilsProvider>    
                            </Fragment>
                        )}
                    } else {
                        return <TextField
                                autoFocus
                                key={value}
                                id={value}
                                variant='outlined'
                                label={FORM_LABELS[value]}
                                type="email"
                                value={localData[value]}
                                onChange = {e => saveLocalData(value, e.target.value)}
                            />
                    }
                }
            })}
            <Box>
              <Map mapCenter={mapCenter} setMapCenter = {setMapCenter} bounds= {bounds} setBounds = {setBounds} saveMapData = {saveMapData} /> 
            </Box>
            </Box>
        </DialogContent>
        <DialogActions className = {classes.confirmation}>
            <Button onClick={handleClose} color="primary">
            Cancel
            </Button>
            <Button onClick={handleSubmit} color="primary">
            Subscribe
            </Button>
        </DialogActions>
        </Dialog>
    );
}