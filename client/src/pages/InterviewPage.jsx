import React from 'react'
import InterviewSetup from '../components/InterviewSetup'
import InterviewSession from '../components/InterviewSession'
import InterviewResult from '../components/InterviewResult'
import { useState } from 'react'

function InterviewPage() {
    const [step, setStep] = useState(1);
    const [interviewData, setInterviewData] = useState(null);

    return (
        <div className="min-h-screen bg-gray-50">
            {step === 1 && (
                <InterviewSetup onStart={(data) => {
                    setInterviewData(data);
                    setStep(2);
                }} />
            )}
            {step === 2 && (
                <InterviewSession interviewData={interviewData} onFinish={(report) => {
                    setInterviewData(report);
                    setStep(3);
                }} />
            )}
            {step === 3 && (
                <InterviewResult report={interviewData} />
            )}
        </div>
    )
}
export default InterviewPage