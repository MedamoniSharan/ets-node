import { motion } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import { DroneDetailsForm } from './Forms/DroneDetailsForm';
import { TravellingDetailsForm } from './Forms/TravellingDetailsForm';
import { OnFieldDetailsForm } from './Forms/OnFieldDetailsForm';
import { FlightNotesForm } from './Forms/FlightNotesForm'; // Combined form
import { GettingOffFieldForm } from './Forms/GettingOffFieldForm';
import { ReturnToOfficeForm } from './Forms/ReturnToOfficeForm';
import { DroneSubmissionForm } from './Forms/DroneSubmissionForm';
import { DataSubmissionForm } from './Forms/DataSubmissionForm';
import { TaskProgressForm } from './Forms/TaskProgressForm';
import type { Task } from './types/index';

const steps = [
  'Drone Details',
  'Travelling Details',
  'On-Field Details',
  'Flight Notes', 
  'Getting OFF Field',
  'Return to Office',
  'Drone Submission',
  'Data Submission',
  'Task Progress',
];

interface TaskStepperProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  task: Task;
  onClose: () => void;
}

export const TaskStepper = ({ currentStep, setCurrentStep, task, onClose }: TaskStepperProps) => {
  const forms = [
    <DroneDetailsForm currentStep={currentStep} setCurrentStep={setCurrentStep} task={task} />,
    <TravellingDetailsForm currentStep={currentStep}setCurrentStep={setCurrentStep}  task={task} />,
    <OnFieldDetailsForm currentStep={currentStep} setCurrentStep={setCurrentStep} task={task} />,
    <FlightNotesForm currentStep={currentStep} setCurrentStep={setCurrentStep} task={task} />, 
    <GettingOffFieldForm currentStep={currentStep} setCurrentStep={setCurrentStep} task={task} />,
    <ReturnToOfficeForm currentStep={currentStep} setCurrentStep={setCurrentStep} task={task} />,
    <DroneSubmissionForm currentStep={currentStep} setCurrentStep={setCurrentStep} task={task} />,
    <DataSubmissionForm currentStep={currentStep} setCurrentStep={setCurrentStep} task={task} />,
    <TaskProgressForm currentStep={currentStep}setCurrentStep={setCurrentStep}  task={task} />,
  ];

  const handleFinish = () => {
    setTimeout(() => onClose(), 500); 
  };

  return (
    <div>
      <ToastContainer />
      <div className="mb-8">
        {/* Step progress bar */}
        <div className="overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-indigo-600 transition-all duration-500"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Step buttons */}
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5">
          {steps.map((step, index) => (
            <button
              key={step}
              onClick={() => setCurrentStep(index)}
              className={`flex flex-col items-center ${
                index <= currentStep ? 'text-indigo-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`mb-2 h-8 w-8 rounded-full flex items-center justify-center border-2 ${
                  index <= currentStep
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-gray-300'
                }`}
              >
                {index + 1}
              </div>
              <span className="text-xs text-center">{step}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Form display */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="mt-8"
      >
        {forms[currentStep]}
      </motion.div>

      {/* Navigation buttons */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => {
            if (currentStep === steps.length - 1) {
              handleFinish();
            } else {
              setCurrentStep(Math.min(steps.length - 1, currentStep + 1));
            }
          }}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
};
