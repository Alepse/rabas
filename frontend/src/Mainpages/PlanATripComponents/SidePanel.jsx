import React from "react";
import Planner from '@/Mainpages/PlanATripComponents/SchedulesPlan'; // Ensure this path is correct
const BASE_URL = import.meta.env.VITE_BASE_URL; 
const SidePanel = ({tripName, tripDate, firstDestination, itinerary, onItineraryChange}) => {
    const formatTripDate = (date) => {
        if (date && date.calendar) {
          const { day, month, year } = date;
          return `${month}/${day}/${year}`;
        }
        return null; 
      };

      console.log(itinerary);

    const startDate = tripDate?.start ? formatTripDate(tripDate.start) : null;
    const endDate = tripDate?.end ? formatTripDate(tripDate.end) : null;

    // console.log(tripDate); 
    function convertTo12HourFormat(time) {
        if (!time) return "Visit Time"; // Default if time is not provided
    
        const [hour, minute] = time.split(":").map(Number); // Split time and convert to numbers
        const ampm = hour >= 12 ? "PM" : "AM";
        const formattedHour = hour % 12 || 12; // Convert 0 to 12 for midnight
        return `${formattedHour}:${minute.toString().padStart(2, "0")} ${ampm}`;
    };

    let destinationOrder = 1;
    
    return (
        <div className="bg-white shadow-lg rounded-lg px-4 py-8 overflow-y-auto max-h-[800px]">
            <h2 className="text-lg font-semibold">Trip Details Overview</h2>
            <p><strong>Trip Name:</strong> {tripName || ""}</p>
            <p><strong>Destination:</strong> {firstDestination || "No selected destination"}</p>
            <p>
                <strong>Trip Date:</strong>{" "}
                {startDate && endDate
                ? `${startDate} - ${endDate}`
                : "Selected dates"}
            </p>

            {/* Stops List */}
            <div className="mt-4">
                <div className="relative border-l-4 border-gray-300 pl-4">
                    {itinerary && Object.keys(itinerary).length > 0 ? (
                        Object.keys(itinerary).map((date, index) => {
                            const stops = itinerary[date];

                            // Sort stops by time before rendering
                            const sortedStops = [...stops].sort((a, b) => {
                                const timeA = a.time || "23:59"; // Default to the end of the day if time is not specified
                                const timeB = b.time || "23:59";
                                return timeA.localeCompare(timeB);
                            });

                            

                            return (
                                <div key={index} className="mb-5">
                                    <p className="text-lg font-bold mb-2">{date}</p>
                                    {sortedStops && sortedStops.length > 0 ? (
                                        sortedStops.map((stop, stopIndex) => (
                                            <div key={stopIndex} className="relative">
                                                <span className="absolute -left-7 top-1 bg-gray-800 text-white w-6 h-6 flex items-center justify-center rounded-full text-sm">
                                                    {destinationOrder++}
                                                </span>
                                                <h3 className="text-sm font-semibold py-2">
                                                    {convertTo12HourFormat(stop?.time)}
                                                </h3>
                                                <div className="mt-2 bg-white shadow-md rounded-lg border p-3 flex flex-col items-center gap-3">
                                                    <img
                                                        src={`${BASE_URL}/${stop?.imageUrl}` || "https://via.placeholder.com/80"}
                                                        alt={stop?.name || "Business Image"}
                                                        className="w-20 h-14 object-cover rounded-md"
                                                    />
                                                    <div>
                                                        <h3 className="text-sm font-semibold">{stop?.name || "Business Name"}</h3>
                                                        <p className="text-xs text-gray-500">
                                                            {stop?.location || "Location"} | {stop?.type || "Business Category"}
                                                        </p>
                                                        <p className="text-yellow-500 text-sm">
                                                            {stop?.rating ? (
                                                                <>
                                                                    {` ${parseFloat(stop.rating).toFixed(1)}`}
                                                                    {"★".repeat(Math.floor(parseFloat(stop.rating)))}
                                                                    {"☆".repeat(5 - Math.floor(parseFloat(stop.rating)))}
                                                                </>
                                                            ) : (
                                                                "No Rating"
                                                            )}
                                                        </p>
                                                        <p className="text-sm">{stop?.notes || "No additional notes"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="mt-2 text-gray-500">No stops for this date</p>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <p>No itinerary available</p>
                    )}
                </div>
            </div>



            

            {/* <Planner
                startDate={tripDate?.start}
                endDate={tripDate?.end}
                itinerary={itinerary}
                onItineraryChange={onItineraryChange}
            /> */}


            {/* Travel Time Total */}
            {/* <p className="text-sm font-semibold mt-4">Travel Time Total: 3hrs 22mins</p> */}
        </div>
    );
};

export default SidePanel;
