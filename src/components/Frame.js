import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPipe } from '@fortawesome/pro-solid-svg-icons';
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
              <FontAwesomeIcon
                style={{ position: 'absolute', margin: '0px auto' }}
                icon={faPipe}
              ></FontAwesomeIcon>
              <div style={{ marginTop: '20px', position: 'absolute' }}>
                <Typography key={i} fontSize='.7rem'>
                  {props.locs.fraction[i]}
                </Typography>
              </div>
            </div>
          );
        })}
      </div>
    </Container>
  );
}
