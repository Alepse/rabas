import React from 'react';
import { Card, CardHeader, CardBody, Button } from "@nextui-org/react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EmergencyHotlines = () => {
  const importantHotlines = [
    { name: 'SORSOGON PROVINCE DRRMO', number: '911' },
    { name: 'PHILIPPINE NATIONAL POLICE', number: '0998-598-6062' },
    { name: 'BUREAU OF FIRE PROTECTION', number: '0909-456-7636' },
    { name: 'PHILIPPINE RED CROSS', number: '0920-545-3905 / 0915-262-4959' },
    { name: 'SEGURIDAD KAAYUSAN, KATRANQUILOHAN, KAUSINAGAN', number: '0909-640-1742 / 0955-437-3028' },
    { name: 'CITY HEALTH OFFICE - SORSOGON CITY', number: '0917-538-0362' },
  ];

  const localHotlines = [
    { name: 'Barcelona', number: '0950-674-0375' },
    { name: 'Bulusan', number: '0948-768-6843' },
    { name: 'Bulan', number: '0961-823-4182' },
    { name: 'Casiguran', number: '0908-884-8400' },
    { name: 'Castilla', number: '0928-949-6045' },
    { name: 'Donsol', number: '0999-471-9654' },
    { name: 'Gubat', number: '0977-810-3233' },
    { name: 'Irosin', number: '0919-831-4437' },
    { name: 'Juban', number: '0918-304-3502' },
    { name: 'Magallanes', number: '0930-709-7811' },
    { name: 'Matnog', number: '0928-904-6383' },
    { name: 'Pilar', number: '0947-813-3933' },
    { name: 'Pto. Diaz', number: '0948-848-6636' },
    { name: 'Sta. Magdalena', number: '0920-738-7494' },
    { name: 'Sorsogon City', number: '0929-431-7493' },
    { name: 'Soreco I', number: '0948-148-7981' },
    { name: 'Soreco II', number: '0939-445-4902 / 0929-132-3947' },
    { name: 'EDC - Bacman', number: '0917-529-4934' },
    { name: 'NGCP', number: '0917-859-4815' },
    { name: 'RDRRMC - Bicol', number: '0928-505-3861' },
    { name: 'Department of Interior Local Government', number: '0920-590-7962' },
    { name: 'Office of Civil Defense V', number: '0928-505-3861' },
    { name: 'Armed Forces of the Philippines', number: '0917-700-9036' },
    { name: 'NDRRMC', number: '(02)911-1406' },
  ];

  const HotlineButton = ({ name, number }) => {
    const handleCopy = () => {
      navigator.clipboard.writeText(number)
        .then(() => toast.success(`Copied ${number} to clipboard`))
        .catch(() => toast.error('Failed to copy'));
    };

    return (
      <Button
        className="flex justify-between items-center w-full p-4 rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-200"
        onClick={handleCopy}
      >
        <span className="text-sm font-medium text-gray-800">{name}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-600">{number}</span>
        </div>
      </Button>
    );
  };

  return (
    <div className="container mx-auto mt-8 px-4">
      <Card className="shadow-lg rounded-lg">
        <CardHeader className="px-6 py-4 border-b flex-col border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Sorsogon Emergency Hotlines</h2>
          <p className="text-gray-600 mt-1">Important numbers to call during emergencies</p>
        </CardHeader>
        <CardBody className="px-6 py-6">
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Important Hotlines</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {importantHotlines.map((hotline, index) => (
                <HotlineButton key={index} name={hotline.name} number={hotline.number} />
              ))}
            </div>
          </section>
          <section>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Local Hotlines</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {localHotlines.map((hotline, index) => (
                <HotlineButton key={index} name={hotline.name} number={hotline.number} />
              ))}
            </div>
          </section>
        </CardBody>
      </Card>
      <ToastContainer />
    </div>
  );
};

export default EmergencyHotlines;
