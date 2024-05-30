import React, { useCallback, useEffect, useState } from 'react'
import LiveCursor from './Cursor/LiveCursor'
import { useBroadcastEvent, useEventListener, useMyPresence } from '@/liveblocks.config'
import CursorChat from './Cursor/CursorChat'
import { CursorMode, CursorState, Reaction } from '@/types/type'
import ReactionSelector from './reaction/ReactionButton'
import FlyingReaction from './reaction/FlyingReaction'
import useInterval from '@/hooks/useInterval'
import { Comments } from './comments/Comments'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { shortcuts } from '@/constants'


type Prop ={
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>,
  undo: () => void
  redo: () => void
};

const Live = ({canvasRef, undo, redo}: Prop) => {
  const [{cursor}, updateMyPresence] = useMyPresence()
  const [cursorState, setcursorState] = useState<CursorState>({
    mode: CursorMode.Hidden
  })
  const [reaction, setreaction] = useState<Reaction[]>([])

  const broadcast = useBroadcastEvent();

  useInterval(() => {
    setreaction((reaction) => reaction.filter((r) => r.timestamp > Date.now() -4000))
  }, 1000)

  useInterval(() =>{
    if(cursorState.mode === CursorMode.Reaction && cursorState.isPressed && cursor){
      setreaction((reactions) => reactions.concat([
        {point:{x: cursor.x, y: cursor.y}, 
        value: cursorState.reaction, 
        timestamp: Date.now()
      }
      ]))

      broadcast({value: cursorState.reaction, x: cursor.x, y: cursor.y})
    }
    
  }, 50);

  useEventListener((eventData) => {
    const event = eventData.event;

    setreaction((reactions) => reactions.concat([
      {point:{x: event.x, y: event.y}, value: event.value, timestamp: Date.now()}
    ]))
  })

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    event.preventDefault()

    if(cursor == null || cursorState.mode !== CursorMode.ReactionSelector){

      const x = event.clientX - event.currentTarget.getBoundingClientRect().x
      const y = event.clientY - event.currentTarget.getBoundingClientRect().y
  
      updateMyPresence({cursor: {x, y}})
    }

  }, [])

  const handlePointerLeave = useCallback((event: React.PointerEvent) => {
    setcursorState({mode: CursorMode.Hidden})

    updateMyPresence({cursor: null, message: null})
  }, [])

  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    // event.preventDefault()

    const x = event.clientX - event.currentTarget.getBoundingClientRect().x
    const y = event.clientY - event.currentTarget.getBoundingClientRect().y

    updateMyPresence({cursor: {x, y}})

    setcursorState((state: CursorState) => cursorState.mode === CursorMode.Reaction ? {...state, isPressed: true } : state)
  }, [cursorState.mode, setcursorState])

  const handlePointerUp = useCallback((event: React.PointerEvent) => {
    setcursorState((state: CursorState) => cursorState.mode === CursorMode.Reaction ? {...state, isPressed: true } : state)
  }, [cursorState.mode, setcursorState])

  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if(e.key === "/"){
        setcursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: "", 
        })
      }else if(e.key === 'Escape') {
        updateMyPresence({message: ''})        
        setcursorState({
          mode: CursorMode.Hidden
        })
      }else if(e.key === 'e'){
        setcursorState({
          mode: CursorMode.ReactionSelector
        })
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if(e.key === "/") {
        e.preventDefault()
      }
    }
    window.addEventListener("keyup", onKeyUp)
    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keyup", onKeyUp)
      window.removeEventListener("keydown", onKeyDown)
    } 
  }, [updateMyPresence])


  const setReaction = useCallback((reaction: string) => {
    setcursorState({mode: CursorMode.Reaction, reaction, isPressed: false})
  }, [])

  const handleContextMenuClick = useCallback((key: string) => {
    switch (key){
      case 'Chat':
        setcursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: "",
        })
        break;
      case 'Undo':
        undo()
        break;
      case 'Redo':
        redo()
        break;
      case 'Reactions':
        setcursorState({
          mode: CursorMode.ReactionSelector
        })
        break;
      

    }
  } ,[])

  return (
    <ContextMenu>
      <ContextMenuTrigger
      id='canvas'
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp = {handlePointerUp}
      className='relative h-full flex-1 w-full justify-center items-center flex'>

        <canvas className="border-green-500 border-4" ref={canvasRef} />

        {reaction.map((r) => (
          <FlyingReaction key={r.timestamp.toString()} x={r.point.x} y={r.point.y} timestamp={r.timestamp} value={r.value}/>
        ))}

        {cursor && (
        <CursorChat cursor = {cursor} cursorState = {cursorState} setCursorState = {setcursorState} updateMyPresence = {updateMyPresence}/>
        )}

        {cursorState.mode === CursorMode.ReactionSelector &&(
          <ReactionSelector setReaction={setReaction}/>
        )}
        <LiveCursor/>

        <Comments />
      </ContextMenuTrigger>

      <ContextMenuContent className='right-menu-content'>
        {shortcuts.map((item) => (
          <ContextMenuItem key={item.key} onClick={() => handleContextMenuClick(item.name)} className='right-menu-item'>
              <p>{item.name}</p>
              <p className='text-xs text-primary-grey-300'>
                 {item.shortcut}
              </p>
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  )
}

export default Live