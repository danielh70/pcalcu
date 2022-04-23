import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import '../App.css';

export default function Frame(props) {
  return (
    <Container>
      <div className='frame'>
        {props.locs.decimal.map((el, i) => {
          return (
            <div
              key={i}
              style={{
                left: `${(el / props.totalLength) * 100}%`,
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <i
                style={{ position: 'absolute', margin: '0px auto' }}
                className='fa-light fa-pipe'
              >
                <Typography key={i} fontSize='10px'>
                  {props.locs.fraction[i]}
                </Typography>
              </i>
            </div>
          );
        })}
      </div>
    </Container>
  );
}
