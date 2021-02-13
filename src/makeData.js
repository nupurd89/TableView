import React, {useState} from 'react'
import { render } from '@testing-library/react'
import namor from 'namor'
import Component from "@reactions/component";
import { Pane, Dialog, Button, ArrowBottomRightIcon } from 'evergreen-ui'

//const Component = ReactionsComponent;



//const updateArr = () => setArrayaa()

const arrayaa = [
    {"customerName": "Dropbox", "status":"available", "syncedFrom": "Zuora", "startDate": "2019-01-01", "mrr": 1200, "termLength": 12, "invoiceNo": 1},
    {"customerName": "Intercom", "status":"available", "syncedFrom": "Stripe", "startDate": "2019-01-01", "mrr": 455, "termLength": 3, "invoiceNo": 2},
    {"customerName": "Dropbox", "status":"available", "syncedFrom": "Chargebee", "startDate": "2019-01-01", "mrr": 1200, "termLength": 5, "invoiceNo": 3},
    {"customerName": "Zoom", "status":"available", "syncedFrom": "Zuora", "startDate": "2019-01-01", "mrr": 446, "termLength": 6, "invoiceNo": 4},
    {"customerName": "Heroku", "status":"available", "syncedFrom": "Zuora", "startDate": "2019-01-01", "mrr": 1455, "termLength": 2, "invoiceNo": 5},
    {"customerName": "Apple", "status":"available", "syncedFrom": "Zuora", "startDate": "2019-01-01", "mrr": 899, "termLength": 6, "invoiceNo": 6},
    {"customerName": "Zeneifts", "status":"available", "syncedFrom": "Stripe", "startDate": "2019-01-01", "mrr": 5666, "termLength": 3, "invoiceNo": 7},
    {"customerName": "Notion", "status":"available", "syncedFrom": "Stripe", "startDate": "2019-01-01", "mrr": 1200, "termLength": 6, "invoiceNo": 8},
    {"customerName": "Italic", "status":"available", "syncedFrom": "Stripe", "startDate": "2019-01-01", "mrr": 1200, "termLength": 8, "invoiceNo": 9},
    {"customerName": "Netflix", "status":"available", "syncedFrom": "Zuora", "startDate": "2019-01-01", "mrr": 890, "termLength": 1, "invoiceNo": 10},
]



function viewDetails(otherstate) {
    return(
        <>
            <Component initialState={{ isShown: false }}>
            {({ state, setState }) => (
            <Pane>
                <Dialog
                isShown={state.isShown}
                title="Export JSON object"
                onCloseComplete={() => setState({ isShown: false })}
                >
                    <code>
                        {JSON.stringify(otherstate)}
                    </code>

                </Dialog>
        
                <Button onClick={() => setState({ isShown: true })}>Export Data</Button>
            </Pane>
            )}
        </Component>
      </>
    )
} 

export default function makeData(arr) {
 console.log(JSON.stringify(arrayaa));
  const makeDataLevel = () => {
    return arrayaa.map(data => {
      return data;
    })
  }

  return makeDataLevel()
}

export {
    viewDetails
}
