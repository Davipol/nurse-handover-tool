"use client";
import React from "react";

const PatientPage = async ({ params }) => {
  const { bed } = await params;
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Patient in Bed {bed}</h1>
      <p>This will show all handovers for this patient</p>
    </div>
  );
};

export default PatientPage;
