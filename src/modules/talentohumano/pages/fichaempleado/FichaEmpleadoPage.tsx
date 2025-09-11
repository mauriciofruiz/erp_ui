import { AnimatePresence, motion } from 'framer-motion';
import { CardsFichaEmployee } from './CardsFichaEmployee';
import { Grid, Button } from '@mui/material';
import React, { useState } from 'react';

export type FichaEmpleadoProps = {};

type CardType = {
  id: number;
  content: React.ReactNode;
};

const variants = {
  enter: {
    x: '100%',
    opacity: 0,
  },
  active: {
    x: 0,
    opacity: 1,
  },
  exit: {
    x: '-100%',
    opacity: 0,
  },
};

export const FichaEmpleadoPage: React.FC<FichaEmpleadoProps> = ({}) => {
  // * Constantes para manejar las cards
  const [currentCard, setCurrentCard] = useState(0);

  const [currentDirection, setCurrentDirection] = useState(1);

  const handleClickNext = () => {
    setCurrentCard((prevCard) =>
      prevCard === cards.length - 1 ? 0 : prevCard + 1
    );
    setCurrentDirection(1);
  };

  const handleClickPrev = () => {
    setCurrentCard((prevCard) =>
      prevCard === 0 ? cards.length - 1 : prevCard - 1
    );
    setCurrentDirection(-1);
  };

  // * Terminan constantes de card

  const [visibleButtons, setVisibleButtons] = useState(false); // * constant para visualizar o no los botones de navegación del carousel

  // * Constante para guardar todas las cards que se mostraran en el carousel
  const cards: CardType[] = CardsFichaEmployee(
    setVisibleButtons,
    handleClickNext,
    setCurrentCard
  );

  return (
    <>
      <Grid container className="centered-grid" sx={{ minHeight: '100vh' }}>
        {/* Button on the middle left */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            position: 'fixed',
            top: '50%',
            left: '20%', // Adjust the left value as needed to position the button horizontally
            transform: 'translateY(-50%)', // Center the button vertically
            zIndex: 1,
          }}
        >
          <Button
            variant="contained"
            onClick={handleClickPrev}
            color="primary"
            sx={{
              visibility: visibleButtons ? 'visible' : 'hidden',
            }}
          >
            {'<'}
          </Button>
        </div>

        {/* Button on the middle right */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            position: 'fixed',
            top: '50%',
            right: '20px', // Adjust the right value as needed to position the button horizontally
            transform: 'translateY(-50%)', // Center the button vertically
            zIndex: 1,
          }}
        >
          <Button
            variant="contained"
            onClick={handleClickNext}
            color="primary"
            sx={{
              visibility: visibleButtons ? 'visible' : 'hidden',
            }}
          >
            {'>'}
          </Button>
        </div>

        {/* Centered container for AnimatePresence */}
        <div
          style={{
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <div
            style={{
              flex: 1, // Adjust the maxWidth as needed to control the size of AnimatePresence
              position: 'relative',
              display: 'grid',
              placeItems: 'center',
              width: '90%',
            }}
          >
            <AnimatePresence>
              {cards.map(
                (card: CardType, i: number) =>
                  currentCard === i && (
                    <motion.div
                      key={card.id}
                      variants={variants}
                      initial="enter"
                      animate="active"
                      exit="exit"
                      custom={currentDirection}
                      transition={{
                        x: { type: 'spring', stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 },
                      }}
                      style={{ width: 'auto', margin: '0 20px' }}
                    >
                      {card.content}
                    </motion.div>
                  )
              )}
            </AnimatePresence>
          </div>
        </div>
      </Grid>
    </>
  );
};
