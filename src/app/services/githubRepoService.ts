import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const repoOwner = 'ekinomicss'; 
const repoName = 'volley_toy_dropdown'; 
const token = process.env.GITHUB_TOKEN; 

const baseUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents`;

// Function to fetch the contents of a directory or a file from GitHub
const fetchRepoContents = async (path: string = '') => {
  try {
    const response = await axios({
      url: `${baseUrl}/${path}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'repo-content-fetcher'
      }
    });

    const repoContents = response.data;
    return Array.isArray(repoContents) ? repoContents : [];
  } catch (error) {
    console.error(`Error fetching repository contents from ${path}:`, error);
    return [];
  }
};

// Fetch the raw content of a file from GitHub
const fetchFileContent = async (fileUrl: string) => {
  try {
    const response = await axios({
      url: fileUrl,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'repo-content-fetcher',
        Accept: 'application/vnd.github.v3.raw' // To fetch raw content
      }
    });

    if (typeof response.data === 'object') {
      return JSON.stringify(response.data, null, 2);
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching file content from ${fileUrl}:`, error);
    return '';
  }
};

// Recursive function to process the contents of the repository, including subdirectories
export const concatRepoContents = async (currentPath: string = ''): Promise<string> => {
  let allContent = '';
  const repoContents = await fetchRepoContents(currentPath);

  for (const item of repoContents) {
    if (item.type === 'file') {
      const fileContent = await fetchFileContent(item.url);
      allContent += `File Name: ${item.name}\nPath: ${item.path}\nContent:\n${fileContent}\n\n`;
    } else if (item.type === 'dir') {
      // Recursively fetch contents from subdirectories
      const subDirContent = await concatRepoContents(item.path);
      allContent += subDirContent;
    }
  }

  return allContent;
};

// Test 
concatRepoContents()
  .then(content => {
    console.log('Concatenated Repository Content:\n', content);
  })
  .catch(error => {
    console.error('Failed to concatenate repository contents:', error);
  });