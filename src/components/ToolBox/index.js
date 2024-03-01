import { useSelector, useDispatch } from 'react-redux';
import cx from 'classnames';
import { COLORS, MENU_ITEMS } from '@/constant';
import { changeColor, changeBrushSize } from '@/slice/toolBoxSlice';
import styles from './index.module.css';
import { socket } from "@/socket";

const ToolBox = () => {
  const dispatch = useDispatch();
  const activeMenuItem = useSelector((state) => state.menu.activeMenuItem);
  const showStrokeToolOption = activeMenuItem === MENU_ITEMS.PENCIL;
  const showBrushToolOption = showStrokeToolOption || activeMenuItem === MENU_ITEMS.ERASER; // Updated condition
  const {color, size} = useSelector((state) => state.toolbox[activeMenuItem])

  const updateBrushSize = (e) => {
    dispatch(changeBrushSize({item: activeMenuItem, size:parseInt(e.target.value)}))
    socket.emit('changeConfig', {color, size: e.target.value})
  };

  const updateColor = (color) => {
    dispatch(changeColor({item: activeMenuItem, color: color}))
    socket.emit('changeConfig', {color: color, size })
  }

  return (
    <div className={styles.toolBoxContainer}>
      {showStrokeToolOption && 
        <div className={styles.toolItem}>
          <h4 className={styles.tolText}>Stroke Color</h4>
          <div className={styles.itemContainer}>
            <div className={cx(styles.colorBox, 
            {[styles.active]: color === COLORS.BLACK})} 
            style={{ backgroundColor: COLORS.BLACK }} 
            onClick = {() => updateColor(COLORS.BLACK)}/>

            <div className={cx(styles.colorBox, 
            {[styles.active]: color === COLORS.RED})} 
            style={{ backgroundColor: COLORS.RED }} 
            onClick = {() => updateColor(COLORS.RED)}/>

            <div className={cx(styles.colorBox, 
            {[styles.active]: color === COLORS.GREEN})} 
            style={{ backgroundColor: COLORS.GREEN }} 
            onClick = {() => updateColor(COLORS.GREEN)}/>

            <div className={cx(styles.colorBox, 
            {[styles.active]: color === COLORS.BLUE})} 
            style={{ backgroundColor: COLORS.BLUE }} 
            onClick = {() => updateColor(COLORS.BLUE)}/>

            <div className={cx(styles.colorBox, 
            {[styles.active]: color === COLORS.ORANGE})} 
            style={{ backgroundColor: COLORS.ORANGE }} 
            onClick = {() => updateColor(COLORS.ORANGE)}/>

            <div className={cx(styles.colorBox, 
            {[styles.active]: color === COLORS.YELLOW})} 
            style={{ backgroundColor: COLORS.YELLOW }} 
            onClick = {() => updateColor(COLORS.YELLOW)}/>
          </div>
        </div>
      }
      {showBrushToolOption && 
        <div className={styles.toolItem}>
          <h4 className={styles.toolText}>Brush Size</h4>
          <div className={styles.itemContainer}>
            <input type="range" min={1} max={10} step={1} onChange={updateBrushSize} />
          </div>
        </div>
      }
    </div>
  );
};

export default ToolBox;
