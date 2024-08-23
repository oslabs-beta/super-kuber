import React from 'react'
import { useState, useEffect } from 'react'

import { Avatar } from '../../components/template/avatar'
import { Button } from '../../components/template/button'
import { Heading, Subheading } from '../../components/template/heading'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/template/table'
import { Select } from '../../components/template/select'




function Alerts() {
  const [ cpuData, setCpuData ] = useState([]);
  const [ runningPods, setRunningPods ] = useState(null);
  const [ podDetails, setPodDetails] = useState([]); //array of pod names to compare
  const [ prevPodDetails, setPrevPodDetails ] = useState([]);
  const [ failedPods, setFailedPods ] = useState(0);
  const [ prevFailedPods, setPrevFailedPods ] = useState(0);
  const [ restartedPod, setRestartedPods ] = useState(0);
  const [ prevRestartedPod, setPrevRestartedPods ] = useState(0)

  // replace with fetch request
  let alerts = [
    {
      id: 1,
      date: 'Aug 1, 2024',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      status: 'unread',
    },
    {
      id: 2,
      date: 'Aug 3, 2024',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      status: 'unread',
    },
    {
      id: 3,
      date: 'Aug 12, 2024',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      status: 'read',
    },
    {
      id: 4,
      date: 'Aug 16, 2024',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      status: 'unread',
    },
    {
      id: 5,
      date: 'Aug 17, 2024',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      status: 'read',
    },

  ]


  // alerts requests to backend
  const sendCpuAlert = async (cpuUsageValue) => {
    try {
      const response = await fetch ('http://localhost:8080/alert/all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          alert: `CPU usage is high: ${cpuUsageValue}%`
          // category: cpu
        })
      });
      if (response.ok){
        console.log('CPU alert was sent successfully');
      } else {
        console.log('cpu alert failed to send');
      }
    } catch (err) {
      console.log(err);
    }
  }

  const podFailedAlert = async (failedPod) => {
    try {
      const response = await fetch ('http://localhost:8080/alert/all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          alert: `${failedPod} has failed`,
          podId: failedPod[0],
          // pod id, previous pod name, alert log, category: pods
        })
      });
      if (response.ok){
        console.log('Failed pod alert was sent successfully');
      } else {
        console.log('Failed pod alert failed to send');
      }
    } catch (err) {
      console.log(err);
    }
  }




  //grab details of all current pods
  useEffect(() => {
    const pods = async () => {
      try {
        const response = await fetch('http://localhost:9090/api/v1/query?query=kube_pod_info')
        const data = await response.json();
        console.log('pod descriptions', data)
        const podNames = data.data.result.map((pod) => pod.metric.pod)
        setPodDetails(podNames);
      }
      catch(err) {
        console.log(err)
      }
    }
    pods();
    const intervalID = setInterval(() => {
      pods()
    }, 5000)

    return () => clearInterval(intervalID);
  }, [])

  //set previous pod names to current at startup
  useEffect(() => {
    setPrevPodDetails(podDetails)
  }, [])

  //checks if current pod name array is different from prev pod name array
  useEffect(() => {
    const failedPod = prevPodDetails.filter(pod => !podDetails.includes(pod)) 
    const restartedPod = podDetails.filter(pod => !prevPodDetails.includes(pod))
    console.log(podDetails)
    console.log(prevPodDetails)
    console.log("TESTING TESTING TESTING"+ failedPod);
    if (failedPod.length > 0 && podDetails.length === prevPodDetails.length) {
      // podFailedAlert(failedPod);
      alert(`Pod "${failedPod[0]}" has failed and has been restarted with "${restartedPod[0]}"`)
    }
    setPrevPodDetails(podDetails);
  }, [podDetails, prevPodDetails])


  //node sessions 
  useEffect(() => {
    const nodeSessions = async () => {
      try {
      const response = await fetch('http://localhost:9090/api/v1/query?query=count(kube_node_info)')
      const data = await response.json();
      console.log('node sessions', data)
      }
      catch(err) {
        console.log(err)
      }
    }
    nodeSessions();
  }, [])

  // grab CPU usage per node
  useEffect(() => {
    const cpuUsage = async () => {
      try {
        const response = await fetch('http://localhost:9090/api/v1/query?query=100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[10m]) * 100) * on(instance) group_left(nodename) (node_uname_info))');
        const data = await response.json();
        // iterate over result index number for each node
        for (let i = 0; i < data.data.result.length; i++){
          // want specific node name + cpu usage
          const cpuUsageValue = data.data.result[i].value[1];
          console.log(cpuUsageValue);
          // alert base case
          setCpuData(cpuUsageValue);
          if (cpuUsageValue > cpuThreshold) {
            await sendCpuAlert(cpuUsageValue);
            cpuAlert(cpuUsageValue);
        }

        }
        console.log('cpu usuage', data)
      }
      catch(err){
        console.log(err)
      }
    }
    cpuUsage();
  }, [])

  const cpuThreshold = 80;
  const cpuAlert = () => {
    alert('CPU Usage is too high!')
  }

  // grab amount of time pods restarted
  // useEffect(() => {
  //   const podRestart = async () => {
  //     try {
  //       const response = await fetch('http://localhost:9090/api/v1/query?query=increase(kube_pod_container_status_restarts_total[5m])');
  //       const data = await response.json();
  //       // setCpuData(data);
  //       // console.log('pod restarts', data)
  //       let podRestartCount = 0;
  //       for (let i = 0; i < data.data.result.length; i++) {
  //         // let podRestartCount = data.data.results[i].value[1];
  //         // if (podRestartCount > 0){
  //         //   podAlert();
  //         // }
  //         podRestartCount += Number(data.data.result[i].value[1])
  //       }
  //       setRestartedPods(podRestartCount);
  //     }
  //     catch(err){
  //       console.log(err)
  //     }
  //   }
  //   podRestart();
  //   const intervalID = setInterval(() => {
  //     podRestart();
  //   }, 5000)

  //   return () => clearInterval(intervalID);
  // }, [])

  // //checks if current restart pod count is greater than prev restart pod count
  // useEffect(() => {
  //   if (restartedPod > prevRestartedPod) {
  //     console.log('Pod has restarted');
  //     podAlert();
  //     setPrevRestartedPods(restartedPod)
  //   }
  // }, [restartedPod])

  // const podAlert = () => {
  //   alert('A pod just restarted')
  // }
 
  // grab number of running pods
  useEffect(() => {
    const runningPods = async () => {
      try {
        const response = await fetch('http://localhost:9090/api/v1/query?query=count(kube_pod_status_phase{phase="Running"})');
        const data = await response.json();
        console.log('number of running pods', data);
        setRunningPods(data.data.result[0].value[1]);
      }
      catch(err){
        console.log(err)
      }
    }
    runningPods();
  }, [])

  //failed pods
  useEffect(() => {
    const failedPods = async () => {
      try {
        const response = await fetch('http://localhost:9090/api/v1/query?query=sum(kube_pod_status_phase{phase="Failed"})');
        const data = await response.json();
        // console.log('failed pods', data);
        setFailedPods(Number(data.data.result[0].value[1]));
      }
      catch(err) {
        console.log(err)
      }
    }
    failedPods();
    const intervalID = setInterval(() => {
      failedPods();
    }, 5000)

    return () => clearInterval(intervalID);
  }, [])

  //checks to see if current pods failed is greater than previous failed pods count
  useEffect(() => {
    if (failedPods > prevFailedPods) {
      console.log('Pod has failed');
      alert('Pod has failed');
      setPrevFailedPods(failedPods)
    }
  }, [failedPods])

  //running containers
  useEffect(() => {
    const runningContainers = async () => {
      try {
        const response = await fetch('http://localhost:9090/api/v1/query?query=count(container_last_seen)');
        const data = await response.json();
        console.log('running containers', data)
      }
      catch(err) {
        console.log(err)
      }
    }
    runningContainers();
  }, [])

  return (
    <>
      {/* <div>Alerts - just trying to display data now</div>
      <h1>Running Pods: {runningPods}</h1>
      <h1>Failed Pods: {failedPods}</h1> */}

      <div className="flex items-end justify-between gap-4">
        <Heading>New Alerts</Heading>
        {/* <Button className="-my-0.5">Create order</Button> */}
      </div>
      
      <Table className="mt-8 mb-12 [--gutter:theme(spacing.6)] lg:[--gutter:theme(spacing.10)]">
        <TableHead>
          <TableRow>
            <TableHeader>Id</TableHeader>
            <TableHeader>Alert Date</TableHeader>
            <TableHeader>Description</TableHeader>
            <TableHeader>Status</TableHeader>
            {/*<TableHeader className="text-right">Amount</TableHeader> */}
          </TableRow>
        </TableHead>
        <TableBody>
          {alerts.map((alert) => (
            (alert.status === 'unread' && 
            <TableRow key={alert.id}>
              <TableCell>{alert.id}</TableCell>
              <TableCell className="text-zinc-500">{alert.date}</TableCell>
              <TableCell className="whitespace-normal max-w-sm max-h-24">{alert.description}</TableCell>
              <TableCell>
                <Select name="status">
                  <option value="active">Unread</option>
                  <option value="completed">Read</option>
                </Select>
              </TableCell>

              {/* <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar src={order.event.thumbUrl} className="size-6" />
                  <span>{order.event.name}</span>
                </div>
              </TableCell> */}
              {/* <TableCell className="text-right">US{order.amount.usd}</TableCell> */}
            </TableRow>
          ))
        )}
        </TableBody>
      </Table>
      
      <div className="flex items-end justify-between gap-4">
        <Heading>Resolved Alerts</Heading>
        {/* <Button className="-my-0.5">Create order</Button> */}
      </div>

      <Table className="mt-8 [--gutter:theme(spacing.6)] lg:[--gutter:theme(spacing.10)]">
        <TableHead>
          <TableRow>
            <TableHeader>Id</TableHeader>
            <TableHeader>Alert Date</TableHeader>
            <TableHeader>Description</TableHeader>
            <TableHeader>Status</TableHeader>
            {/*<TableHeader className="text-right">Amount</TableHeader> */}
          </TableRow>
        </TableHead>
        <TableBody>
          {alerts.map((alert) => (
            (alert.status === 'read' && 
            <TableRow key={alert.id}>
              <TableCell>{alert.id}</TableCell>
              <TableCell className="text-zinc-500">{alert.date}</TableCell>
              <TableCell className="whitespace-normal max-w-sm max-h-24">{alert.description}</TableCell>
              <TableCell>
                <Select name="status">
                  <option value="active">Unread</option>
                  <option value="completed">Read</option>
                </Select>
              </TableCell>

              {/* <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar src={order.event.thumbUrl} className="size-6" />
                  <span>{order.event.name}</span>
                </div>
              </TableCell> */}
              {/* <TableCell className="text-right">US{order.amount.usd}</TableCell> */}
            </TableRow>
          ))
        )}
        </TableBody>
      </Table>
      

    </>



  )
}

export default Alerts