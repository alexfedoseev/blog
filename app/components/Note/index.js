/* @flow */

import * as React from 'react';

import { P } from 'app/components';

import styles from './styles.css';

type $Props = {| children?: React.Node |};

export const Note = ({ children }: $Props) => (
  <P className={styles.note}>{children}</P>
);
