import {SERVER_IP_ADDRESS} from '@env';
import {io} from 'socket.io-client';

export const socket = io(SERVER_IP_ADDRESS);
