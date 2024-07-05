"use client"
import React, { useState } from 'react'
import RegisterClientForm from '@/components/RegisterClientForm';
import { Form, Steps } from 'antd';

const { Item } = Form;
const { Step } = Steps;

const RegisterClientView = () => {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className='flex-col'>
      <div className='mb-8 mx-auto w-48 min-[576px]:w-full'>
        <Steps current={currentStep} className=''>
          <Step title="Registrar Cliente" />
          <Step title="Procesar venta" />
          <Step title="Resumen" />
        </Steps>
      </div>
      {
        currentStep === 0 && (
          <RegisterClientForm current={currentStep} setCurrentStep={setCurrentStep} />
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

export default RegisterClientView;