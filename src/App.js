import React, {useState} from 'react'
import styled from 'styled-components'
import { useTable, useFilters, useGlobalFilter, useAsyncDebounce } from 'react-table'
import {matchSorter} from 'match-sorter'
import { TextInput, Popover, Pane, Button, Dialog } from 'evergreen-ui'
import SplitPane from 'react-split-pane';
import ReactTable from "react-table";
import Component from "@reactions/component";
import './style.css';

import makeData, {viewDetails} from './makeData'

const Styles = styled.div`
  padding: 1rem;


  table {
    border-spacing: 0;
    border-top: 1px solid black;
    width: 1000px;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid #f8f9fb;

      :last-child {
        border-right: 0;
      }
    }
  }
`
const tableStyle = {
  border: "none",
  boxShadow: "none"
};

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef()
    const resolvedRef = ref || defaultRef

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate
    }, [resolvedRef, indeterminate])

    return <input type="checkbox" ref={resolvedRef} {...rest} />
  }
)

function GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}) {
  const count = preGlobalFilteredRows.length
  const [value, setValue] = React.useState(globalFilter)
  const onChange = useAsyncDebounce(value => {
    setGlobalFilter(value || undefined)
  }, 200)

  return (
    <span>
    </span>
  )
}

function DefaultColumnFilter({
  column: { filterValue, preFilteredRows, setFilter },
}) {
  const count = preFilteredRows.length

  return (
    <input
      value={filterValue || ''}
      onChange={e => {
        setFilter(e.target.value || undefined) 
      }}
      placeholder={`Search ${count} records...`}
    />
  )
}

// This is a custom filter UI for selecting
// a unique option from a list
function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
}) {
  // Calculate the options for filtering
  // using the preFilteredRows
  const options = React.useMemo(() => {
    const options = new Set()
    preFilteredRows.forEach(row => {
      options.add(row.values[id])
    })
    return [...options.values()]
  }, [id, preFilteredRows])

  // Render a multi-select box
  return (
    <select
      value={filterValue}
      onChange={e => {
        setFilter(e.target.value || undefined)
      }}
    >
      <option value="">All</option>
      {options.map((option, i) => (
        <option key={i} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}

function SliderColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
}) {
  // Calculate the min and max
  // using the preFilteredRows

  const [min, max] = React.useMemo(() => {
    let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0
    let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0
    preFilteredRows.forEach(row => {
      min = Math.min(row.values[id], min)
      max = Math.max(row.values[id], max)
    })
    return [min, max]
  }, [id, preFilteredRows])

  return (
    <>
      <input
        type="range"
        min={min}
        max={max}
        value={filterValue || min}
        onChange={e => {
          setFilter(parseInt(e.target.value, 10))
        }}
      />
      <button onClick={() => setFilter(undefined)}>Off</button>
    </>
  )
}

function NumberRangeColumnFilter({
  column: { filterValue = [], preFilteredRows, setFilter, id },
}) {
  const [min, max] = React.useMemo(() => {
    let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0
    let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0
    preFilteredRows.forEach(row => {
      min = Math.min(row.values[id], min)
      max = Math.max(row.values[id], max)
    })
    return [min, max]
  }, [id, preFilteredRows])

  return (
    <div
      style={{
        display: 'flex',
      }}
    >
      <input
        value={filterValue[0] || ''}
        type="number"
        onChange={e => {
          const val = e.target.value
          setFilter((old = []) => [val ? parseInt(val, 10) : undefined, old[1]])
        }}
        placeholder={`Min (${min})`}
        style={{
          width: '70px',
          marginRight: '0.5rem',
        }}
      />
      to
      <input
        value={filterValue[1] || ''}
        type="number"
        onChange={e => {
          const val = e.target.value
          setFilter((old = []) => [old[0], val ? parseInt(val, 10) : undefined])
        }}
        placeholder={`Max (${max})`}
        style={{
          width: '70px',
          marginLeft: '0.5rem',
        }}
      />
    </div>
  )
}

function fuzzyTextFilterFn(rows, id, filterValue) {
  return matchSorter(rows, filterValue, { keys: [row => row.values[id]] })
}

// Let the table remove the filter if the string is empty
fuzzyTextFilterFn.autoRemove = val => !val

// Our table component
function Table({ columns, data }) {
  const filterTypes = React.useMemo(
    () => ({
      // Add a new fuzzyTextFilterFn filter type.
      fuzzyText: fuzzyTextFilterFn,
      // Or, override the default text filter to use
      // "startWith"
      text: (rows, id, filterValue) => {
        return rows.filter(row => {
          const rowValue = row.values[id]
          return rowValue !== undefined
            ? String(rowValue)
                .toLowerCase()
                .startsWith(String(filterValue).toLowerCase())
            : true
        })
      },
    }),
    []
  )

  const defaultColumn = React.useMemo(
    () => ({
      // Let's set up our default Filter UI
      Filter: DefaultColumnFilter,
    }),
    []
  )

  const {
    getTableProps,
    getTableBodyProps,
    getToggleHideAllColumnsProps,
    headerGroups,
    rows,
    prepareRow,
    allColumns,
    setFilter,
    state,
    setHiddenColumns,
    visibleColumns,
    preGlobalFilteredRows,
    initialState,
    setGlobalFilter,
    setState
  } = useTable(
    {
      columns,
      data,
      defaultColumn, 
      filterTypes,
    },
    useFilters, 
    useGlobalFilter 
  )

  const [filterInput, setFilterInput] = React.useState("");

  const handleFilterChange = (columnidthing, e) => {
    console.log("here");
    console.log(columnidthing);
    const value = e.target.value || undefined;
    setFilter(columnidthing, value); // Update the show.name filter. Now our table will filter and show only the rows which have a matching value
    setFilterInput(value);
  };

  const currColumns = allColumns.map(column => {
    if(column.id == 'mrr' || column.id == 'termLength' || column.id == 'invoiceNo'){
      var columnidthing = column.id;
      console.log("nothere");
      console.log(columnidthing);
      return (
        <div key={column.id} class="checkboxes">
        <label class="filterspacing">
          <input type="checkbox" {...column.getToggleHiddenProps()} />{' '}
          {column.id}
        </label>
          <Popover
          bringFocusInside
          content={
            <Pane width={300} height={100}>
              <p class="center">Set your filter:</p>
              <div class="center">{column.canFilter ? column.render('Filter') : null}</div>
            </Pane>
          }
        >
          <Button class="filterbutt">Filter</Button>
        </Popover>


        </div>
      )
    } 
    else {
      return( 
        <div key={column.id} class="checkboxes">
        <label>
          <input type="checkbox" {...column.getToggleHiddenProps()} />{' '}
          {column.id}
        </label>
      </div>
      )
    }
      
    
  })

  const updateData = (par) => {
    if(par == null || par.length == 0){
      console.log("no parr");
    } else {
      console.log(par);
      var num = par.indexOf('a');
      console.log(num);
      var jsonobj = JSON.parse(par);
      var hc = JSON.stringify(jsonobj.hiddenColumns);
      var filt = jsonobj.filters;
      var id = filt.id;
      console.log(JSON.stringify(id));
      console.log(hc);
      console.log(filt);
      setHiddenColumns(jsonobj.hiddenColumns);
      //setFilter(jsonobj.filters.id, jsonobj.filters.value);
    }
    
  }

  function ImportData() {
    const [string, setString] = useState('');

    return (
        <>
        <Component initialState={{ isShown: false }}>
        {({ state, setState }) => (
            <Pane>
            <Dialog
                isShown={state.isShown}
                title="Paste Data Below"
                onCloseComplete={() => {setState({ isShown: false }); updateData(string)}}
                confirmLabel="Import"
            >
                <textarea
                    name="input"
                    type="text"
                    value={string}
                    onChange = {e => setString(e.target.value)}
                />
            </Dialog>

            <Button onClick={(e) => { setState({ isShown: true });  }}>Import Data</Button>
            </Pane>
        )}
        </Component>
        </>
    )
}

  // We don't want to render all of the rows for this example, so cap
  // it for this use case
  const firstPageRows = rows.slice(0, 10)

  return (
    <>
      <title>Subscription</title>
      <SplitPane>
        <h2 class="title">Subscription List</h2>
        <div class="buttons">
          {viewDetails(state)}
          {ImportData()}
        </div>
      </SplitPane>
      <Pane float="left" background="#f8f9fb" class="view" height = {800} width={300}>
        <div>
          <IndeterminateCheckbox {...getToggleHideAllColumnsProps()} /> Toggle
          All
        </div>
        {currColumns}
        <br />
      </Pane>
      <table class="table" {...getTableProps()}>
        <thead class="tableheaders">
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th class="tableheaders" {...column.getHeaderProps()}>
                  {column.render('Header')}
                  {/* Render the columns filter UI */}
                  
                </th>
              ))}
            </tr>
          ))}
          <tr>
            <th
              colSpan={visibleColumns.length}
              style={{
                textAlign: 'left',
              }}
            >
              <GlobalFilter
                preGlobalFilteredRows={preGlobalFilteredRows}
                globalFilter={state.globalFilter}
                setGlobalFilter={setGlobalFilter}
              />
            </th>
          </tr>
        </thead>
        <tbody {...getTableBodyProps()}>
          {firstPageRows.map((row, i) => {
            prepareRow(row)
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => {
                  return <td class="cell" {...cell.getCellProps()}>{cell.render('Cell')}</td>
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
      <br />
      <div>Showing {rows.length} rows</div>
    </>
  )
}

// Define a custom filter filter function!
function filterGreaterThan(rows, id, filterValue) {
  return rows.filter(row => {
    const rowValue = row.values[id]
    return rowValue >= filterValue
  })
}

// This is an autoRemove method on the filter function that
// when given the new filter value and returns true, the filter
// will be automatically removed. Normally this is just an undefined
// check, but here, we want to remove the filter if it's not a number
filterGreaterThan.autoRemove = val => typeof val !== 'number'

function App() {
  const columns = React.useMemo(
    () => [
          {
            Header: 'First Name',
            accessor: 'customerName',
          },
          {
            Header: 'Status',
            accessor: 'status',
          },
          {
            Header: 'Start Date',
            accessor: 'startDate',
            Filter: SliderColumnFilter,
            filter: 'equals',
          },
          {
            Header: 'MRR',
            accessor: 'mrr',
            Filter: NumberRangeColumnFilter,
            filter: 'between',
          },
          {
            Header: 'Term Length',
            accessor: 'termLength',
            Filter: NumberRangeColumnFilter,
            filter: 'between',
          },
          {
            Header: 'Invoice No',
            accessor: 'invoiceNo',
            Filter: NumberRangeColumnFilter,
            filter: 'between',
          },
    ],
    []
  )

  const data = React.useMemo(() => makeData(100000), [])

  return (
    <Styles>
      <Table columns={columns} data={data} />
    </Styles>
  )
}

export default App
