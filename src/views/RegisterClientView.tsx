"use client"
import React, { useState } from 'react'
import RegisterClientForm from '@/components/RegisterClientForm';
import { Form, Steps } from 'antd';

const { Item } = Form;
const { Step } = Steps;

export default function RegisterClientView() {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className='flex flex-col'>
      <div className='mx-auto sm:mx-1'>
        <Steps current={currentStep} style={{ marginBottom: '24px' }}>
          <Step title="Registrar Cliente" />
          <Step title="Procesar venta" />
          <Step title="Resumen" />
        </Steps>
      </div>
      {
        currentStep === 0 && (
          <RegisterClientForm current={currentStep} setCurrentStep={setCurrentStep}/>
        )
      }

      {
        currentStep === 1 && (
          <div className='mx-auto sm:mx-1'>
            hola
          </div>
        )
      }

    </div>
  )
}
