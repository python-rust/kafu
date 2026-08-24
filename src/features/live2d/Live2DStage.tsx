import { useState } from 'react';

import { DevelopmentPuppet } from './DevelopmentPuppet';
import styles from './Live2DStage.module.css';

export function Live2DStage() {
  const [interactionCount, setInteractionCount] = useState(0);

  return (
    <section className={styles.stage} aria-label="2D character stage">
      <div className={styles.orbit} aria-hidden="true" />
      <div className={styles.axis} aria-hidden="true" />

      <DevelopmentPuppet
        onInteraction={() => setInteractionCount((count) => count + 1)}
      />

      <div className={styles.runtimeNote} aria-live="polite">
        <span>DEVELOPMENT PUPPET</span>
        <span aria-hidden="true">/</span>
        <span>{interactionCount.toString().padStart(2, '0')} SIGNALS</span>
      </div>
    </section>
  );
}
