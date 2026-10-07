import "leaflet/dist/leaflet.css";
import "../../css/Playback.css";

import L from "leaflet";
import ReactDOMServer from "react-dom/server";

import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import { FaBus } from "react-icons/fa";
const PLAYBACK_ZOOM = 16;
const SIMULATION_SEGMENT_MS = 650;

function calculateBearing(from, to) {
  if (!from || !to) {
    return 0;
  }

  const lat1 = (Number(from.lat) * Math.PI) / 180;
  const lat2 = (Number(to.lat) * Math.PI) / 180;

  const lng1 = (Number(from.lng) * Math.PI) / 180;
  const lng2 = (Number(to.lng) * Math.PI) / 180;

  const y =
    Math.sin(lng2 - lng1) * Math.cos(lat2);

  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) *
    Math.cos(lat2) *
    Math.cos(lng2 - lng1);

  const bearing =
    (Math.atan2(y, x) * 180) / Math.PI;

  return (bearing + 360) % 360;
}

function getCourse(from, to) {
  const pointCourse = Number(to?.course);

  if (
    Number.isFinite(pointCourse) &&
    pointCourse !== 0
  ) {
    return pointCourse;
  }

  return calculateBearing(from, to);
}

const locationPinIcon = L.divIcon({
  className: "sf-playback-coordinate-icon",

  html: `
    <div
      style="
        font-size: 20px;
        line-height: 20px;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-shadow: 0 1px 3px rgba(0,0,0,0.45);
      "
    >
      📍
    </div>
  `,

  iconSize: [20, 20],
  iconAnchor: [10, 20],
});

const startIcon = L.divIcon({
  className: "sf-start-marker",

  html: `
    <div class="sf-start-dot">
      S
    </div>
  `,

  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const endIcon = L.divIcon({
  className: "sf-end-marker",

  html: `
    <div class="sf-end-dot">
      E
    </div>
  `,

  iconSize: [28, 28],

  iconAnchor: [14, 14],
});

function createBusIcon(course = 0) {
  const html = ReactDOMServer.renderToString(
    <div
      className="sf-bus-wrapper"
      style={{
        transform: `rotate(${course}deg)`,
      }}
    >
      <div className="sf-bus-shadow" />

      <div className="sf-bus-body">
        <FaBus />
      </div>
    </div>
  );

  return L.divIcon({
    className: "sf-bus-marker",

    html,

    iconSize: [50, 50],

    iconAnchor: [25, 25],

    popupAnchor: [0, -25],
  });
}

function removeDuplicatePoints(points) {
  if (!points.length) {
    return [];
  }

  const result = [points[0]];

  for (let i = 1; i < points.length; i += 1) {
    const previous = result[result.length - 1];
    const current = points[i];

    const samePosition =
      Number(previous.lat) === Number(current.lat) &&
      Number(previous.lng) === Number(current.lng);

    const sameTimestamp =
      previous.timestamp === current.timestamp;

    if (samePosition && sameTimestamp) {
      continue;
    }

    result.push(current);
  }

  return result;
}

function PlaybackAnimator({
  points,
  isPlaying,
  currentIndex,
  setCurrentIndex,
  playbackSpeed,
  onFinish,
}) {
  const map = useMap();
  const [position, setPosition] = useState(null);
  const [course, setCourse] = useState(0);

  const currentIndexRef =
    useRef(currentIndex);

  const animationRef =
    useRef(null);

  const segmentIndexRef =
    useRef(currentIndex);

  const segmentStartRef =
    useRef(null);

  useEffect(() => {
    currentIndexRef.current =
      currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    if (!points.length) {
      setPosition(null);
      return;
    }

    const safeIndex = Math.min(
      Math.max(currentIndex, 0),
      points.length - 1
    );

    const point = points[safeIndex];

    const nextPoint =
      points[
      Math.min(
        safeIndex + 1,
        points.length - 1
      )
      ];

    const nextPosition = [
      Number(point.lat),
      Number(point.lng),
    ];

    setPosition(nextPosition);

    setCourse(
      getCourse(point, nextPoint)
    );

    map.setView(
      nextPosition,
      PLAYBACK_ZOOM,
      {
        animate: false,
      }
    );
  }, [currentIndex, points, map]);

  useEffect(() => {
    if (
      !isPlaying ||
      points.length < 2
    ) {
      if (animationRef.current) {
        cancelAnimationFrame(
          animationRef.current
        );
      }

      animationRef.current = null;
      segmentStartRef.current = null;
      return;
    }

    segmentIndexRef.current =
      currentIndexRef.current;

    segmentStartRef.current = null;


    const animate = (timestamp) => {
      const index =
        currentIndexRef.current;

      if (
        index >=
        points.length - 1
      ) {
        const last =
          points[points.length - 1];

        const finalPosition = [
          Number(last.lat),
          Number(last.lng),
        ];

        setPosition(
          finalPosition
        );

        setCourse(
          getCourse(
            points[
            Math.max(
              0,
              points.length - 2
            )
            ],
            last
          )
        );

        map.setView(
          finalPosition,
          PLAYBACK_ZOOM,
          {
            animate: false,
          }
        );

        onFinish();

        animationRef.current =
          null;

        return;
      }

      if (
        segmentStartRef.current ===
        null ||
        segmentIndexRef.current !==
        index
      ) {
        segmentIndexRef.current =
          index;

        segmentStartRef.current =
          timestamp;
      }


      const from =
        points[index];

      const to =
        points[index + 1];


      /*
       * Playback duration.
       */

      const segmentDuration =
        Math.max(
          35,
          SIMULATION_SEGMENT_MS /
          playbackSpeed
        );


      const elapsed =
        timestamp -
        segmentStartRef.current;


      const progress = Math.min(
        elapsed /
        segmentDuration,
        1
      );

      const smoothProgress =
        progress < 0.5
          ? 2 *
          progress *
          progress
          : 1 -
          Math.pow(
            -2 * progress + 2,
            2
          ) / 2;

      const lat =
        Number(from.lat) +
        (Number(to.lat) -
          Number(from.lat)) *
        smoothProgress;

      const lng =
        Number(from.lng) +
        (Number(to.lng) -
          Number(from.lng)) *
        smoothProgress;


      const nextPosition = [
        lat,
        lng,
      ];


      /*
       * Calculate vehicle direction.
       */

      const nextCourse =
        getCourse(from, to);


      /*
       * Update vehicle.
       */

      setPosition(
        nextPosition
      );

      setCourse(
        nextCourse
      );

      map.setView(
        nextPosition,
        PLAYBACK_ZOOM,
        {
          animate: false,
        }
      );


      if (progress >= 1) {
        currentIndexRef.current =
          index + 1;

        setCurrentIndex(
          index + 1
        );

        segmentStartRef.current =
          timestamp;
      }


      animationRef.current =
        requestAnimationFrame(
          animate
        );
    };


    animationRef.current =
      requestAnimationFrame(
        animate
      );



    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(
          animationRef.current
        );
      }

      animationRef.current =
        null;

      segmentStartRef.current =
        null;
    };
  }, [
    isPlaying,
    playbackSpeed,
    points,
    setCurrentIndex,
    onFinish,
    map,
  ]);



  if (!position) {
    return null;
  }


  const currentPoint =
    points[
    Math.min(
      currentIndex,
      points.length - 1
    )
    ] || points[0];



  const busIcon =
    createBusIcon(course);


  const playedRoute = [
    ...points
      .slice(
        0,
        Math.min(
          currentIndex + 1,
          points.length
        )
      )
      .map((point) => [
        Number(point.lat),
        Number(point.lng),
      ]),

    position,
  ];


  return (
    <Fragment>
      {playedRoute.length > 1 && (
        <Polyline
          positions={playedRoute}
          pathOptions={{
            color: "#e11d48",
            weight: 6,
            opacity: 0.95,
            lineCap: "round",
            lineJoin: "round",
          }}
        />
      )}


      {/*
       * MOVING BUS
       */}

      <Marker
        position={position}
        icon={busIcon}
        zIndexOffset={10000}
        interactive={false}
      >
        <Popup>
          <div className="sf-bus-popup">

            <div className="sf-bus-popup-title">
              Playback Vehicle
            </div>

            <div>
              <strong>
                Time:
              </strong>{" "}
              {currentPoint?.timestamp
                ? new Date(
                  currentPoint.timestamp
                ).toLocaleString()
                : "--"}
            </div>

            <div>
              <strong>
                Speed:
              </strong>{" "}
              {currentPoint?.speed ??
                0}{" "}
              km/h
            </div>

            <div>
              <strong>
                Mileage:
              </strong>{" "}
              {currentPoint?.mileage ??
                0}{" "}
              km
            </div>

          </div>
        </Popup>
      </Marker>

    </Fragment>
  );
}

function InitialMapViewport({
  points,
}) {
  const map = useMap();

  const initializedRef =
    useRef(false);

  useEffect(() => {

    initializedRef.current = false;
  }, [points]);


  useEffect(() => {
    if (
      !points.length ||
      initializedRef.current
    ) {
      return;
    }

    initializedRef.current =
      true;

    const firstPoint =
      points[0];

    map.setView(
      [
        Number(firstPoint.lat),
        Number(firstPoint.lng),
      ],
      PLAYBACK_ZOOM,
      {
        animate: false,
      }
    );
  }, [map, points]);


  return null;
}

function PlaybackMap({
  points,
  isPlaying,
  currentIndex,
  setCurrentIndex,
  playbackSpeed,
  onFinish,
}) {

  const displayPoints = useMemo(
    () =>
      removeDuplicatePoints(
        points
      ),
    [points]
  );

  const completeRoute =
    useMemo(() => {
      return displayPoints.map(
        (point) => [
          Number(point.lat),
          Number(point.lng),
        ]
      );
    }, [displayPoints]);

  const firstPoint =
    displayPoints.length > 0
      ? [
        Number(
          displayPoints[0].lat
        ),
        Number(
          displayPoints[0].lng
        ),
      ]
      : [19.076, 72.8777];

  const lastPoint =
    displayPoints.length > 0
      ? [
        Number(
          displayPoints[
            displayPoints.length - 1
          ].lat
        ),
        Number(
          displayPoints[
            displayPoints.length - 1
          ].lng
        ),
      ]
      : null;


  return (
    <div className="sf-playback-map">

      <MapContainer
        center={firstPoint}
        zoom={PLAYBACK_ZOOM}
        style={{
          height: "100%",
          width: "100%",
        }}
      >

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <InitialMapViewport
          points={displayPoints}
        />

        {completeRoute.length > 1 && (
          <Polyline
            positions={completeRoute}
            pathOptions={{
              color: "#64748b",
              weight: 3,
              opacity: 0.18,
              dashArray: "6 10",
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        )}

        {displayPoints
          .slice(
            0,
            Math.min(
              currentIndex + 1,
              displayPoints.length
            )
          )
          .map((point, index) => (
            <Marker
              key={`playback-point-${index}-${point.timestamp}`}
              position={[
                Number(point.lat),
                Number(point.lng),
              ]}
              icon={locationPinIcon}
              interactive={false}
              zIndexOffset={100}
            />
          ))}

        {displayPoints.length >
          0 && (
            <Marker
              position={[
                Number(
                  displayPoints[0].lat
                ),
                Number(
                  displayPoints[0].lng
                ),
              ]}
              icon={startIcon}
              zIndexOffset={500}
              interactive={false}
            />
          )}

        {displayPoints.length >
          1 &&
          !isPlaying &&
          currentIndex >=
          displayPoints.length - 1 && (
            <Marker
              position={lastPoint}
              icon={endIcon}
              zIndexOffset={1000}
              interactive={false}
            />
          )}

        <PlaybackAnimator
          points={displayPoints}
          isPlaying={isPlaying}
          currentIndex={Math.min(
            currentIndex,
            Math.max(
              displayPoints.length - 1,
              0
            )
          )}
          setCurrentIndex={
            setCurrentIndex
          }
          playbackSpeed={
            playbackSpeed
          }
          onFinish={onFinish}
        />

      </MapContainer>

    </div>
  );
}


export default PlaybackMap;