import {useState, useEffect, useRef} from 'react';
import {MapContainer, TileLayer, Marker, useMapEvents, useMap} from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Loader2, Navigation, AlertCircle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

//Fix leaflet default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
    value?: { lat: number; lng: number };
    onChange: (Location: { lat: number; lng: number }) => void;
    label?: string;
    error: string;
}


export default function MapPicker({ value, onChange, label, error }: MapPickerProps) {
    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(value || null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(!value);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [hasAttemptedLocation, setHasAttemptedLocation] = useState(false);

    useEffect(() => {
        if(!hasAttemptedLocation) {
            getCurrentLocation()
            setHasAttemptedLocation(true);
        }
    }, [hasAttemptedLocation])

    useEffect(() => {
        if (value) {
            setPosition(value);
        }
    }, [value]);

    const handlePositionChange = (newPosition: {lat: number; lng: number}) => {
        setPosition(newPosition);
        onChange(newPosition);
        setLocationError(null);
    };

    const getCurrentLocation = () => {
        if(!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser');
            return;
        }

        setIsLoadingLocation(true)
        setLocationError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const newPos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                handlePositionChange(newPos);
                setIsLoadingLocation(false);
            },
            (error) => {
                let errorMessage = 'Unable to get your location';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location access denied. Please enable location permissions.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information unavailable';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out'
                        break;
                }
                setLocationError(errorMessage);
                setIsLoadingLocation(false)
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    if(isLoadingLocation && !position) {
        return (
            <div className='w-full'>
                {label && (
                    <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                        {label}
                    </label>
                )}

                <div className='relative rounded-lg overflow-hidden border-2 border-gray-300 bg-gray-50'>
                    <div className='h-[400px] flex items-center justify-center'>
                        <div className='text-center'>
                            <Loader2 size={48} className='animate-spin text-primary mx-auto mb-4'/>
                            <p className='text-lg font-semibold text-gray-800 mb-2'>
                                Detecting your location...
                            </p>
                            <p className='text-sm text-gray-600'>
                                Please allow location access when prompted
                            </p>
                        </div>
                    </div>
                </div>
                <p className='mt-1.5 text-sm text-gray-500'>
                    Waiting for GPS location...
                </p>
            </div>
        );
    }

    if(locationError && !position){
        return (
            <div className='w-full'>
                {label && (
                    <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                        {label}
                    </label>
                )}

                <div className='relative rounded-lg overflow-hidden border-2 border-red-300 bg-red-50'>
                    <div className='h-[400px] flex items-center justify-center p-8'>
                        <div className='text-center max-w-md'>
                            <AlertCircle size={48} className="text-red-500 mx-auto mb-4"/>
                            <p className='text-lg font-semibold text-red-800 mb-3'>
                                 Location Access Required
                            </p>
                            <p className='text-sm text-red-700 mb-6'>
                                {locationError}
                            </p>

                            <button 
                                type='button'
                                onClick={getCurrentLocation}
                                className='px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors'>
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
                {error && <p className='mt-1.5 text-sm text-red-500'>{error}</p>}
            </div>
        );
    }

    if(!position) {
        return null;
    }


    return(
        <div className='w-full'>
            {label && (
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                    {label}
                </label>
            )}

            <div className={`relative rounded-lg overflow-hidden border-2 ${error? 'border-red-500' : 'border-gray-300'}`}>
                <MapContainer
                    center={[position.lat, position.lng]}
                    zoom = {15}
                    scrollWheelZoom={true}
                    style= {{height: '400px', width: '100%'}}
                >
                    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>

                    <DraggableMarker position={position} onPositionChange={handlePositionChange} />
                    <MapClickHandler onPositionChange={handlePositionChange} />
                    <MapCenterUpdater position={position}/>
                </MapContainer>

                {/* Coordinates display */}
                <div className='absolute bottom-4 left-4 bg-white px-3 py-2 rounded-lg shadow-md z-[1000]'>
                    <div className='flex items-center gap-2 text-sm'>
                        <MapPin size={16} className='text-primary'/>
                        <span className='font-mono text-gray-700'>
                            {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                        </span>
                    </div>
                </div>

                {/* Get Current Location Button */}
                <button
                    type='button'
                    onClick={getCurrentLocation}
                    disabled={isLoadingLocation}
                    className={`absolute top-4 right-4 bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 z-[1000] transition-all duration-200
                        ${isLoadingLocation ? 'bg-gray-200 cursor-not-allowed'
                            : 'bg-white hover:bg-primary hover:text-white'
                        }
                    `} 
                    title="Use current location"
                    >
                        {isLoadingLocation ? (
                            <Loader2 size={20} className='animate-spin text-gray-500'/>
                        ) : (
                            <Navigation size={20}/>
                        )}
                </button>
            </div>

            {/* {error && <p className='mt-1.5 text-sm text-red-500'>{error}</p>}
            {!locationError && (
                <div className='mt-2 p-3 bg-red-50 border border-red-200 rounded-lg'>
                     <p className='text-sm text-red-700'>
                        {locationError}
                     </p>
                </div> 
            )} */}

            {!error && !locationError && (
                <p className='mt-1.5 text-sm text-gray-500'>
                    Click on the map, drag the marker, or use current location
                </p>
            )}
        </div>
    );
}

//Dragable marker
function DraggableMarker({position, onPositionChange}: any) {
    const markerRef = useRef<any>(null);

    const eventHandlers = {
        dragend() {
            const marker = markerRef.current;
            if (marker != null) {
                const newPos = marker.getLatLng();
                onPositionChange(newPos);
            }
        }
    };

    useEffect(() => {
        if (markerRef.current) {
            markerRef.current.setLatLng(position);
        }
    }, [position]);

    return <Marker draggable={true} eventHandlers={eventHandlers} position={position} ref={markerRef} />;
}

//Map click Hander
function MapClickHandler({onPositionChange} : {onPositionChange: (pos: any) => void}){
    useMapEvents({
        click(e){
            onPositionChange(e.latlng);
        }
    });
    return null;
}

function MapCenterUpdater({position}: {position: {lat: number; lng:number}}) {
    const map = useMap()

    useEffect(() => {
        map.flyTo([position.lat, position.lng], 15, {
            duration: 1.5
        });
    }, [position, map]);

    return null;
}