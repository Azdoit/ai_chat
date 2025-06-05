import request from '@/utils/request.js'

export const getRooms = () => {
  return request({
    url: '/camera/list_room',
    method: 'POST',
  })
}

export const getCameras = (data) => {
  return request({
    url: '/camera/camera_by_room',
    method: 'POST',
    data,
  })
}
export const getVideo = (data) => {
  return request({
    url: '/camera/ordinary_search',
    method: 'POST',
    data,
  })
}

export const getVisHistory = (data) => {
  return request({
    url: '/camera/history',
    method: 'POST',
    data,
  })
}

export const getFuels = (data) => {
  return request({
    url: '/camera/fuel_tank_search',
    method: 'POST',
    data,
  })
}

export const getPickups = (data) => {
  return request({
    url: '/pickups/pickups_search',
    method: 'POST',
    data,
  })
}

export const getFuelTankRecordTemperature = (data) => {
  return request({
    url: '/camera/fuel_tank_record_temper',
    method: 'POST',
    data,
  })
}

