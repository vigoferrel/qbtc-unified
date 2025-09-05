# Requires -Version 5.1
# Pester v5+ tests for API key permission detection

$modulePath = Join-Path -Path $PSScriptRoot -ChildPath '..\src\ApiKeyPermissions.psm1'
Import-Module -Force -Name $modulePath

Describe 'Detect-ApiKeyPermissions' {
    Context 'Fully open key (no IP restrictions), Futures disabled' {
        It 'detects open key, ip not evaluated, futures disabled' {
            $permissions = [pscustomobject]@{
                HasFuturesTrading = $false
                IpRestrictions = $null
            }
            $result = Detect-ApiKeyPermissions -Permissions $permissions
            $result.IsOpenKey | Should -BeTrue
            $result.IpRestrictionEnabled | Should -BeFalse
            $result.IpAllowed | Should -Be $null
            $result.CurrentIp | Should -Be $null
            $result.HasFuturesTrading | Should -BeFalse
        }
    }

    Context 'Fully open key (restriction enabled but 0.0.0.0/0 present)' {
        It 'treats as open key and sets IpAllowed true without checking client IP' {
            $permissions = [pscustomobject]@{
                HasFuturesTrading = $true
                IpRestrictions = [pscustomobject]@{
                    Enabled = $true
                    AllowedCidrs = @('0.0.0.0/0')
                }
            }
            $result = Detect-ApiKeyPermissions -Permissions $permissions
            $result.IsOpenKey | Should -BeTrue
            $result.IpRestrictionEnabled | Should -BeTrue
            $result.IpAllowed | Should -BeTrue
            $result.CurrentIp | Should -Be $null
            $result.HasFuturesTrading | Should -BeTrue
        }
    }

    Context 'IP-restricted, client IP allowed' {
        It 'detects IP restriction and allows current IP' {
            Mock -ModuleName ApiKeyPermissions Get-ClientIp { '203.0.113.10' }
            $permissions = [pscustomobject]@{
                HasFuturesTrading = $true
                IpRestrictions = [pscustomobject]@{
                    Enabled = $true
                    AllowedCidrs = @('203.0.113.0/24','198.51.100.0/24')
                }
            }
            $result = Detect-ApiKeyPermissions -Permissions $permissions
            $result.IsOpenKey | Should -BeFalse
            $result.IpRestrictionEnabled | Should -BeTrue
            $result.IpAllowed | Should -BeTrue
            $result.CurrentIp | Should -Be '203.0.113.10'
            $result.HasFuturesTrading | Should -BeTrue
        }
    }

    Context 'IP-restricted, client IP NOT allowed' {
        It 'detects IP restriction and denies current IP' {
            Mock -ModuleName ApiKeyPermissions Get-ClientIp { '192.0.2.50' }
            $permissions = [pscustomobject]@{
                HasFuturesTrading = $false
                IpRestrictions = [pscustomobject]@{
                    Enabled = $true
                    AllowedCidrs = @('203.0.113.0/24','198.51.100.0/24')
                }
            }
            $result = Detect-ApiKeyPermissions -Permissions $permissions
            $result.IsOpenKey | Should -BeFalse
            $result.IpRestrictionEnabled | Should -BeTrue
            $result.IpAllowed | Should -BeFalse
            $result.CurrentIp | Should -Be '192.0.2.50'
            $result.HasFuturesTrading | Should -BeFalse
        }
    }

    Context 'False-positive prevention: empty or malformed CIDR list' {
        It 'handles empty list as restriction enabled but no CIDRs (deny by default)' {
            Mock -ModuleName ApiKeyPermissions Get-ClientIp { '203.0.113.5' }
            $permissions = [pscustomobject]@{
                HasFuturesTrading = $true
                IpRestrictions = [pscustomobject]@{
                    Enabled = $true
                    AllowedCidrs = @()
                }
            }
            $result = Detect-ApiKeyPermissions -Permissions $permissions
            $result.IpRestrictionEnabled | Should -BeTrue
            $result.IsOpenKey | Should -BeFalse
            $result.IpAllowed | Should -BeFalse
        }

        It 'denies when CIDR is malformed' {
            Mock -ModuleName ApiKeyPermissions Get-ClientIp { '203.0.113.5' }
            $permissions = [pscustomobject]@{
                HasFuturesTrading = $true
                IpRestrictions = [pscustomobject]@{
                    Enabled = $true
                    AllowedCidrs = @('not-a-cidr','203.0.113.0/33')
                }
            }
            $result = Detect-ApiKeyPermissions -Permissions $permissions
            $result.IpRestrictionEnabled | Should -BeTrue
            $result.IsOpenKey | Should -BeFalse
            $result.IpAllowed | Should -BeFalse
        }
    }

    Context 'Test-IpInCidr helper' {
        It 'matches IP within /24' {
            Test-IpInCidr -Ip '203.0.113.10' -Cidr '203.0.113.0/24' | Should -BeTrue
        }
        It 'rejects IP outside /24' {
            Test-IpInCidr -Ip '203.0.114.10' -Cidr '203.0.113.0/24' | Should -BeFalse
        }
        It 'accepts 0.0.0.0/0 as universal' {
            Test-IpInCidr -Ip '1.2.3.4' -Cidr '0.0.0.0/0' | Should -BeTrue
        }
    }
}

