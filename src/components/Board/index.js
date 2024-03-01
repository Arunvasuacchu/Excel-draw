import React, { useRef, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { MENU_ITEMS } from "@/constant";
import { actionItemClick } from '@/slice/menu';
import { socket } from "@/socket";

const Board = () => {
    const dispatch = useDispatch();
    const canvasRef = useRef(null);
    const drawHistory = useRef([]);
    const historyPointer = useRef(0);
    const shouldDraw = useRef(false);

    const { activeMenuItem, actionMenuItem } = useSelector((state) => state.menu);
    const { color, size } = useSelector((state) => state.toolbox[activeMenuItem]);

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (actionMenuItem === MENU_ITEMS.DOWNLOAD) {
            const url = canvas.toDataURL();
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = 'sketch.png';
            anchor.click();
            dispatch(actionItemClick(null));
        } else if (actionMenuItem === MENU_ITEMS.UNDO || actionMenuItem === MENU_ITEMS.REDO) {
            if (actionMenuItem === MENU_ITEMS.UNDO && historyPointer.current > 0) {
                historyPointer.current -= 1;
            } else if (actionMenuItem === MENU_ITEMS.REDO && historyPointer.current < drawHistory.current.length - 1) {
                historyPointer.current += 1;
            }
            const imageData = drawHistory.current[historyPointer.current];
            context.putImageData(imageData, 0, 0);
            dispatch(actionItemClick(null)); 
        }
    }, [actionMenuItem, dispatch]);

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        const changeConfig = (color, size) => {
            if (!context) return;
            context.strokeStyle = color;
            context.lineWidth = size;
        };

        const handleChange = (config) => {
            changeConfig(config.color, config.size);
        };

        changeConfig(color, size);
        socket.on('changeConfig', handleChange);

        return () => {
            socket.off('changeConfig', handleChange);
        };

    }, [color, size]);

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const beginPath = (x, y) => {
            context.beginPath();
            context.moveTo(x, y);
        };

        const drawLine = (x, y) => {
            context.lineTo(x, y);
            context.stroke();
        };

        const handleMouseDown = (e) => {
            shouldDraw.current = true;
            context.beginPath();
            beginPath(e.clientX, e.clientY);
            socket.emit('beginPath', { x: e.clientX, y: e.clientY });
        };

        const handleMouseMove = (e) => {
            if (!shouldDraw.current) return;
            drawLine(e.clientX, e.clientY);
            socket.emit('drawLine', { x: e.clientX, y: e.clientY });
        };

        const handleMouseUp = () => {
            shouldDraw.current = false;
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            drawHistory.current.push(imageData);
            historyPointer.current = drawHistory.current.length - 1;
        };

        const handleBeginPath = (path) => {
            beginPath(path.x, path.y);
        };

        const handleDrawLine = (path) => {
            drawLine(path.x, path.y);
        };

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);

        socket.on('beginPath', handleBeginPath);
        socket.on('drawLine', handleDrawLine);

        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);

            socket.off('beginPath', handleBeginPath);
            socket.off('drawLine', handleDrawLine);
        };
    }, []);

    return (
        <canvas ref={canvasRef}></canvas>
    );
};

export default Board;
