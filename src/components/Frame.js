import React from 'react';
import Typography from '@mui/material/Typography';
import '../App.css';

/**
 * find percentage of frame that x measurement is at and divide by total length to get
 * location of hole and display it on frame piece.
 */

export default function Frame(props) {
  return (
    <div className='frame-container'>
      <div className='frame'>
        {props.locs.decimal.map((el, i) => {
          return (
            <div
              key={i}
              style={{
                left: `${(el / props.totalLength) * 100}%`,
                position: 'relative',
              }}
            >
              <i style={{ position: 'absolute' }} className='fa-light fa-pipe'>
                <br />
                <Typography key={i} fontSize='.5rem'>
                  {props.locs.fraction[i]}
                </Typography>
              </i>
            </div>
          );
        })}
      </div>
    </div>
  );
}
