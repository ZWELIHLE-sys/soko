'use client'

import { Banknote } from 'lucide-react'
import type { BankFields } from '../_types'
import styles from '../profile.module.css'

interface Props extends BankFields {
  onChange: (field: keyof BankFields, value: string) => void
}

export function PaymentSection({ bankName, accountHolder, accountNumber, accountType, branchCode, onChange }: Props) {
  return (
    <div className={`${styles.card} ${styles.cardPayment}`}>
      <div className={styles.cardLabel}>
        <Banknote size={14} className={styles.cardLabelIcon} />
        Payment Details
      </div>
      <p className={styles.cardNote}>
        Your bank details are shared with buyers for direct EFT payments. Kept private — only shown at checkout.
      </p>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label className={styles.label}>Bank Name</label>
          <input
            className={styles.input}
            value={bankName}
            onChange={e => onChange('bankName', e.target.value)}
            placeholder="e.g. FNB, Capitec, Standard Bank"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Account Type</label>
          <select className={styles.input} value={accountType} onChange={e => onChange('accountType', e.target.value)}>
            <option value="">Select type</option>
            <option value="Cheque">Cheque</option>
            <option value="Savings">Savings</option>
            <option value="Current">Current</option>
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Account Holder Name</label>
        <input
          className={styles.input}
          value={accountHolder}
          onChange={e => onChange('accountHolder', e.target.value)}
          placeholder="As it appears on your bank account"
        />
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label className={styles.label}>Account Number</label>
          <input
            className={styles.input}
            value={accountNumber}
            onChange={e => onChange('accountNumber', e.target.value)}
            placeholder="Your account number"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Branch Code</label>
          <input
            className={styles.input}
            value={branchCode}
            onChange={e => onChange('branchCode', e.target.value)}
            placeholder="e.g. 250655"
          />
        </div>
      </div>
    </div>
  )
}
