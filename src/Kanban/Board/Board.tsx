import React, { useEffect } from 'react'
import { BoardProps } from './Board.types'
import styles from './Board.module.scss'
import Column from '../Column/Column'
import ColumnType from '../Column/Column.types'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import ColumnProps from '../Column/Column.types'

const Board = ({
  columns,
  setColumns,
  title,
  projectId,
  _id,
  createdAt,
  updatedAt,
  i18n,
}: BoardProps) => {
  const onDragEnd = (result: any) => {
    // dropped nowhere
    if (!result.destination) {
      return
    }

    const source = result.source
    const destination = result.destination

    // did not move anywhere
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    if (result.type === 'BOARD') {
      // reordering columns

      const ordered: string[] = reorder(columns, source.index, destination.index)

      setColumns({ columns: ordered })

      return
    } else if (result.type === 'COLUMN') {
      // reordering items
      const data = reorderColumns(columns, source, destination)
      setColumns({ columns: data })
    }
  }

  const reorderColumns = (columns: ColumnProps[], source: any, destination: any): ColumnType[] => {
    const current = [...columns[source.droppableId].items]
    const next = [...columns[destination.droppableId].items]
    const target = current[source.index]

    // moving to same list
    if (source.droppableId === destination.droppableId) {
      const reordered = reorder(current, source.index, destination.index)
      columns[source.droppableId].items = reordered
      return columns
    }

    // moving to different list

    // remove from original
    current.splice(source.index, 1)
    // insert into next
    next.splice(destination.index, 0, target)

    columns[source.droppableId].items = current
    columns[destination.droppableId].items = next

    return columns
  }

  const reorder = (list: any[], startIndex: number, endIndex: number): any[] => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)

    return result
  }

  const deleteItem = (columnIndex: number, itemIndex: number) => {
    console.log('columnIndex', columnIndex, 'itemIndex', itemIndex)
    columns[columnIndex].items.splice(itemIndex, 1)
    setColumns({ columns: columns })
  }

  const deleteColumn = () => {}

  const addItem = (columnIndex: number, columnId: string) => {
    columns[columnIndex].items.push({
      text: '',
      position: columns[columnIndex].items.length,
      columnId: columnId,
      _id: Math.random().toString(36).substr(2, 9),
    })
    setColumns({ columns: columns })
  }

  const addColumn = () => {}

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="board" direction="horizontal" type="BOARD">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className={styles.board}>
            {columns.map((col: ColumnProps, index: number) => (
              <Draggable draggableId={String(index)} key={index} index={index}>
                {(provided: any) => (
                  <div ref={provided.innerRef} {...provided.draggableProps}>
                    <Column
                      title={col.title}
                      color={col.color}
                      position={col.position}
                      _id={col._id}
                      boardId={col.boardId}
                      createdAt={col.createdAt}
                      updatedAt={col.updatedAt}
                      items={col.items}
                      dragHandleProps={provided.dragHandleProps}
                      i18n={i18n}
                      index={index}
                      addItem={addItem}
                      deleteItem={deleteItem}
                    />
                    {provided.placeholder}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}

export default Board
