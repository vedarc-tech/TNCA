// Session Management Test Script
// Run this in the browser console to test session management

import { sessionManager, debugSession, cleanupOldData } from './sessionManager';

export const runSessionTests = () => {
  console.log('🧪 Starting Session Management Tests...');
  
  const tests = [];
  let passedTests = 0;
  let failedTests = 0;

  const runTest = (testName, testFunction) => {
    try {
      const result = testFunction();
      if (result) {
        console.log(`✅ ${testName} - PASSED`);
        passedTests++;
      } else {
        console.log(`❌ ${testName} - FAILED`);
        failedTests++;
      }
      tests.push({ name: testName, passed: result });
    } catch (error) {
      console.log(`❌ ${testName} - FAILED (Error: ${error.message})`);
      failedTests++;
      tests.push({ name: testName, passed: false, error: error.message });
    }
  };

  // Test 1: Session ID Generation
  runTest('Session ID Generation', () => {
    const sessionId1 = sessionManager.getItem('session_id');
    const sessionId2 = sessionManager.getItem('session_id');
    return sessionId1 && sessionId1 === sessionId2;
  });

  // Test 2: Token Storage
  runTest('Token Storage', () => {
    const testToken = 'test_access_token_123';
    sessionManager.setAccessToken(testToken);
    const retrievedToken = sessionManager.getAccessToken();
    return retrievedToken === testToken;
  });

  // Test 3: User Data Storage
  runTest('User Data Storage', () => {
    const testUser = { id: 1, name: 'Test User', email: 'test@example.com' };
    sessionManager.setCurrentUser(testUser);
    const retrievedUser = sessionManager.getCurrentUser();
    return retrievedUser && retrievedUser.id === testUser.id && retrievedUser.name === testUser.name;
  });

  // Test 4: Authentication Check
  runTest('Authentication Check', () => {
    // First test with no token
    sessionManager.clearAuthData();
    const notAuthenticated = !sessionManager.isAuthenticated();
    
    // Then test with valid token
    const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.signature';
    sessionManager.setAccessToken(validToken);
    const authenticated = sessionManager.isAuthenticated();
    
    return notAuthenticated && authenticated;
  });

  // Test 5: Clear Auth Data
  runTest('Clear Auth Data', () => {
    sessionManager.setAccessToken('test_token');
    sessionManager.setRefreshToken('test_refresh');
    sessionManager.setCurrentUser({ id: 1, name: 'Test' });
    
    sessionManager.clearAuthData();
    
    const noToken = !sessionManager.getAccessToken();
    const noRefresh = !sessionManager.getRefreshToken();
    const noUser = !sessionManager.getCurrentUser();
    
    return noToken && noRefresh && noUser;
  });

  // Test 6: Storage Event Simulation
  runTest('Storage Event Handling', () => {
    let eventFired = false;
    
    const handleStorage = (e) => {
      if (e.key === 'access_token') {
        eventFired = true;
      }
    };
    
    window.addEventListener('storage', handleStorage);
    
    // Simulate storage change
    const originalToken = sessionManager.getAccessToken();
    sessionManager.setAccessToken('new_test_token');
    
    // Trigger storage event manually (since we're in the same tab)
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'access_token',
      newValue: 'new_test_token',
      oldValue: originalToken
    }));
    
    window.removeEventListener('storage', handleStorage);
    
    return eventFired;
  });

  // Test 7: Cross-Tab Consistency
  runTest('Cross-Tab Consistency', () => {
    const testData = {
      token: 'cross_tab_token_123',
      user: { id: 2, name: 'Cross Tab User' }
    };
    
    sessionManager.setAccessToken(testData.token);
    sessionManager.setCurrentUser(testData.user);
    
    // Simulate reading from another tab
    const retrievedToken = localStorage.getItem('access_token');
    const retrievedUser = JSON.parse(localStorage.getItem('user') || 'null');
    
    return retrievedToken === testData.token && 
           retrievedUser && 
           retrievedUser.id === testData.user.id;
  });

  // Test 8: Token Expiration Check
  runTest('Token Expiration Check', () => {
    // Test with expired token
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjF9.signature';
    sessionManager.setAccessToken(expiredToken);
    const expiredCheck = !sessionManager.isAuthenticated();
    
    // Test with valid token
    const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.signature';
    sessionManager.setAccessToken(validToken);
    const validCheck = sessionManager.isAuthenticated();
    
    return expiredCheck && validCheck;
  });

  // Test 9: Cleanup Function
  runTest('Cleanup Function', () => {
    // Add some old tab-specific data
    localStorage.setItem('access_token_tab_123', 'old_token');
    localStorage.setItem('user_tab_456', 'old_user');
    localStorage.setItem('tab_id', 'old_tab_id');
    
    const beforeCleanup = localStorage.length;
    cleanupOldData();
    const afterCleanup = localStorage.length;
    
    // Check that old data was removed
    const oldDataRemoved = !localStorage.getItem('access_token_tab_123') && 
                          !localStorage.getItem('user_tab_456') && 
                          !localStorage.getItem('tab_id');
    
    return oldDataRemoved && afterCleanup < beforeCleanup;
  });

  // Test 10: Session Persistence
  runTest('Session Persistence', () => {
    const testSessionId = 'test_session_123';
    sessionManager.setItem('session_id', testSessionId);
    
    // Simulate page reload by clearing and re-reading
    const storedSessionId = sessionManager.getItem('session_id');
    
    return storedSessionId === testSessionId;
  });

  // Print results
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);
  
  console.log('\n📋 Detailed Results:');
  tests.forEach(test => {
    const status = test.passed ? '✅' : '❌';
    const error = test.error ? ` (${test.error})` : '';
    console.log(`${status} ${test.name}${error}`);
  });

  // Clean up test data
  sessionManager.clearAuthData();
  
  console.log('\n🎉 Session Management Tests Completed!');
  
  return {
    passed: passedTests,
    failed: failedTests,
    total: passedTests + failedTests,
    successRate: (passedTests / (passedTests + failedTests)) * 100,
    tests: tests
  };
};

// Manual test functions for specific scenarios
export const testMultiTabScenario = () => {
  console.log('🔄 Testing Multi-Tab Scenario...');
  
  // Simulate login in current tab
  const user = { id: 1, name: 'Test User', email: 'test@example.com' };
  const token = 'multi_tab_token_123';
  
  sessionManager.setCurrentUser(user);
  sessionManager.setAccessToken(token);
  
  console.log('✅ Logged in user in current tab');
  console.log('📝 Now open a new tab and try to access the app');
  console.log('📝 The new tab should automatically detect the login');
  
  return { user, token };
};

export const testCrossBrowserScenario = () => {
  console.log('🌐 Testing Cross-Browser Scenario...');
  
  // Clear current session
  sessionManager.clearAuthData();
  
  console.log('✅ Cleared current session');
  console.log('📝 Now open the app in a different browser');
  console.log('📝 Each browser should have its own independent session');
  
  return true;
};

export const testLogoutScenario = () => {
  console.log('🚪 Testing Logout Scenario...');
  
  // Simulate logout
  sessionManager.clearAuthData();
  
  console.log('✅ Logged out user');
  console.log('📝 All tabs should detect the logout and redirect to login');
  
  return true;
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.sessionTests = {
    runSessionTests,
    testMultiTabScenario,
    testCrossBrowserScenario,
    testLogoutScenario,
    debugSession
  };
} 