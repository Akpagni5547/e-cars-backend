import { extname } from 'path';
import { HttpException, HttpStatus } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { existsSync, writeFile, mkdirSync, readFile, unlink } from 'fs';
import { promisify } from 'util';

// Allow only images
export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
    return callback(
      new HttpException('Image invalide!', HttpStatus.BAD_REQUEST),
      false,
    );
  }
  callback(null, true);
};

export const editFileName = (req, file, callback) => {
  //const name = file.originalname.split('.')[0];
  const name = uuidv4();
  const fileExtName = extname(file.originalname);
  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 10).toString(10))
    .join('');
  callback(null, `${name}${randomName}${fileExtName}`);
};

/**
 * Check if a file exists at a given path.
 *
 * @param {string} path
 *
 * @returns {boolean}
 */
export const checkIfFileOrDirectoryExists = (path: string): boolean => {
  return existsSync(path);
};

/**
 * Writes a file at a given path via a promise interface.
 *
 * @param {string} path
 * @param {string} fileName
 * @param {string} data
 *
 * @return {Promise<void>}
 */
export const createFile = async (
  path: string,
  fileName: string,
  data: string,
): Promise<void> => {
  if (!checkIfFileOrDirectoryExists(path)) {
    mkdirSync(path);
  }

  const customWriteFile = promisify(writeFile);

  return await customWriteFile(`${path}/${fileName}`, data, 'utf8');
};

/**
 * Gets file data from a given path via a promise interface.
 *
 * @param { string } path
 * @param { string } encoding
 *
 * @returns { Promise< Buffer > }
 */
export const getFile = async (
  path: string,
  encoding: string,
): Promise<string> => {
  const customReadFile = promisify(readFile);

  return encoding ? customReadFile(path, 'utf8') : customReadFile(path, 'utf8');
};

/**
 * Delete file at the given path via a promise interface
 *
 * @param {string} path
 *
 * @returns {Promise<void>}
 */
export const deleteFile = async (path: string): Promise<void> => {
  const customUnlink = promisify(unlink);

  return await customUnlink(path);
};
