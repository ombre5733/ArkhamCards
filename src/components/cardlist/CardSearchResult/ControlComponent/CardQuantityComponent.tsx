import React, { useCallback, useContext, useReducer } from 'react';
import { StyleSheet, View } from 'react-native';

import { TouchableOpacity } from '@components/core/Touchables';
import PlusMinusButtons from '@components/core/PlusMinusButtons';
import { rowHeight, toggleButtonMode } from '../constants';
import space, { xs } from '@styles/space';
import StyleContext from '@styles/StyleContext';
import { EditSlotsActions, useCounter, useEffectUpdate } from '@components/core/hooks';
import StackedCardCount from './StackedCardCount';

interface Props {
  code: string;
  count: number;
  adjustment?: number;
  countChanged: EditSlotsActions;
  limit: number;
  showZeroCount?: boolean;
  forceBig?: boolean;
  reversed?: boolean;
  locked?: boolean;
}

function TinyCardQuantityComponent({ code, locked, count: propsCount, adjustment = 0, countChanged: { setSlot }, limit }: Omit<Props, 'showZeroCount' | 'forceBig'>) {
  const { fontScale } = useContext(StyleContext);
  const [count, updateCount] = useReducer((count: number, action: 'cycle' | 'sync') => {
    if (action === 'cycle') {
      const newCount = (count + 1) % (limit + 1);
      setTimeout(() => setSlot(code, newCount), 100);
      return newCount;
    }
    return propsCount;
  }, propsCount);

  useEffectUpdate(() => {
    updateCount('sync');
  }, [propsCount]);

  const onPress = useCallback(() => {
    updateCount('cycle');
  }, [updateCount]);

  return (
    <View style={[styles.row, { height: rowHeight(fontScale) }]}>
      { locked ? (
        <StackedCardCount count={count + adjustment} showZeroCount />
      ) : (
        <TouchableOpacity onPress={onPress}>
          <StackedCardCount count={count + adjustment} showZeroCount />
        </TouchableOpacity>
      ) }
    </View>
  );
}

function NormalCardQuantityComponent({ code, locked, adjustment = 0, count: propsCount, countChanged: { incSlot, decSlot }, limit, showZeroCount }: Props) {
  const { fontScale } = useContext(StyleContext);
  const [count, incCount, decCount, setCount] = useCounter(propsCount, { min: 0, max: limit, hapticFeedback: true });
  useEffectUpdate(() => {
    setCount(propsCount);
  }, [propsCount]);

  const inc = useCallback(() => {
    incCount();
    incSlot(code, limit);
  }, [incCount, incSlot, code, limit]);
  const dec = useCallback(() => {
    decCount();
    decSlot(code);
  }, [decCount, decSlot, code]);
  if (locked) {
    return (
      <View style={[styles.row, { height: rowHeight(fontScale) }, space.paddingSideS]}>
        <StackedCardCount count={count + adjustment} showZeroCount={showZeroCount} />
      </View>
    );
  }
  return (
    <View style={[styles.row, { height: rowHeight(fontScale) }]}>
      <PlusMinusButtons
        count={count}
        size={36}
        onIncrement={inc}
        onDecrement={dec}
        max={limit}
        hideDisabledMinus
        dialogStyle
        showZeroCount={showZeroCount}
      >
        <StackedCardCount count={count + adjustment} showZeroCount={showZeroCount} />
      </PlusMinusButtons>
    </View>
  );
}

/**
 * Simple sliding card count.
 */
export default function CardQuantityComponent(props: Props) {
  const { fontScale } = useContext(StyleContext);

  if (toggleButtonMode(fontScale) && !props.forceBig) {
    return <TinyCardQuantityComponent {...props} />;
  }
  return <NormalCardQuantityComponent {...props} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: xs,
  },
});
