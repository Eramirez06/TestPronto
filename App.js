import React, { Component } from 'react';
import { ScrollView, SafeAreaView } from 'react-native';
import moment from 'moment';
import Data, { officeHours } from './muckData';
import { DataTable } from 'react-native-paper';

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      available: []
    }
  }

  componentDidMount = () => {
    this.getPersonBussy();
  }


  getPersonBussy = () => {
    let aviable = {};
    Data.forEach(element => {
      let meetings = element.meetings !== undefined ? element.meetings : [];
      this.getAviableSchedule(meetings, aviable, element.name)
    });
    this.getPeobleAviable(aviable) // Obtain people available based on the occupied
  }

  getAviableSchedule = (meetings, aviable, user) => {
    officeHours.forEach(hours => { //Get bussy people by time slot
      this.getTimes(meetings, hours, aviable, user)
    });
  }


  getTimes = (meetings, hours, aviable, user) => {
    let formatHour = moment(hours, "h:mm A");

    meetings.forEach(bussyTime => {
      if (aviable[hours] === undefined) aviable[hours] = [] //Validate no undefined objects
      let timeS = hours.split(':')
      if (aviable[`${timeS[0]}:30`] === undefined) aviable[`${timeS[0]}:30`] = [] //Validate no undefined objects
      let time = moment(bussyTime, "h:mm A")
      let diff = moment.duration(time.diff(formatHour)); // Get diference from hours to now if the person is bussy in this especific time slot
      if (diff.asHours() > 0 && diff.asHours() <= 0.5) {
        let valor = { name: user }
        aviable[`${timeS[0]}:30`].push(valor); //start after half an hour and add the people bussy
      }
      if (diff.asHours() === 0) {
        let valor = { name: user }
        aviable[hours].push(valor); //start when the hour beggin and add the people bussy
      }
    });
  }

  getPeobleAviable = (aviable) => {
    let disponible = {}
    Object.keys(aviable).forEach(key => { // Get the keys of objects to get value
      if (disponible[key] === undefined) disponible[key] = [] //Validate no undefined objects
      Data.forEach(element => {
        let findDetallePerson = aviable[key].find(person => {
          return element.name === person.name;
        })
        if (findDetallePerson === undefined) { // Validate if the people is on array of bussy 
          disponible[key].push(element.name) // set the person available
        }
      });
    })
    this.reduceTimes(disponible)
  }

  reduceTimes = (disponible) => {
    let available = [];
    //Final filter to get at least three people available by time slot
    Object.keys(disponible).forEach(key => disponible[key].length > 2 ? available.push({ key, available: disponible[key] }) : '')
    this.setState({ available })
    console.log(available)
  }


  render() {
    let { available } = this.state;
    return (
      <SafeAreaView>
        <ScrollView>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Hours</DataTable.Title>
              <DataTable.Title>People</DataTable.Title>
            </DataTable.Header>

            {available.map(value => (
              <DataTable.Row key={value.key}>
                <DataTable.Cell>{value.key}</DataTable.Cell>
                <DataTable.Cell>{value.available.join(', ')}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

export default App;
