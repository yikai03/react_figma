'use client'

import LeftSidebar from "@/components/LeftSidebar";
import Live from "@/components/Live";
import Navbar from "@/components/Navbar";
import RightSidebar from "@/components/RightSidebar";
import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { handleCanvasMouseDown, handleResize, initializeFabric } from "@/lib/canvas";
import { ActiveElement } from "@/types/type";

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const isDrawing = useRef(false);
  const shapeRef = useRef<fabric.Object | null>(null);
  const selectedShapeRef = useRef<string | null>('rectangle');

  const [activeElement, setactiveElement] = useState<ActiveElement>({
    name:'',
    value:'',
    icon:''
  })

  const handleActiveElement = (elem: ActiveElement) => {
    setactiveElement(elem)

    selectedShapeRef.current = elem?.value as string
  }

  useEffect(() =>{
    const canvas = initializeFabric({canvasRef, fabricRef})
    // console.log("Canvas initialized:", canvas);
    // console.log("Fabric reference:", fabricRef.current);


    // console.log("Attatching mouse down event")
    canvas.on("mouse:down", (options) => {
      // console.log("Mouse down event fired")
      // console.log("Fabric ref during mouse down: ",fabricRef)
      handleCanvasMouseDown({options, canvas, selectedShapeRef, isDrawing, shapeRef})
    })

    const handleWindowResize = () => {
      // console.log("Window resized")
      handleResize({canvas: fabricRef.current})
    }

    window.addEventListener("resize", handleWindowResize)
  },[])
  
  return (
    <main className="h-screen overflow-hidden ">
      <Navbar 
      activeElement={activeElement} 
      handleActiveElement={handleActiveElement}/>
      
      <section className="flex h-full flex-row">
        <LeftSidebar />
        <Live canvasRef = {canvasRef}/>
        <RightSidebar />
        
      </section>
    </main>
  );
}